/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource, In } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Offer } from '../src/offers/entities/offer.entity';
//Representa un usuario autenticado.
type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  career: string | null;
};
//Respuesta típica de login o registro.
type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUserResponse;
};
//Representa una oferta.
type OfferResponse = {
  id: number;
  title: string;
  description?: string | null;
  company?: string | null;
  location?: string | null;
  salary?: string | null;
  type: string;
  career?: string | null;
  employerId?: string | null;
  createdAt?: string;
};

describe('AppController (e2e)', () => {
  // Identificador unico por ejecucion para evitar conflictos en DB.
  const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`; //esto se utiliza para que los correos sean unicos
  const testUsers = {
    authStudent: {
      email: `e2e.student.${runId}@test.com`,
      password: 'Test12345',
      fullName: 'E2E Cristopher',
      role: 'student',
      career: 'Ingenieria de Software',
    },
    employer: {
      email: `e2e.employer.${runId}@test.com`,
      password: 'Test12345',
      fullName: 'E2E Gonzalo',
      role: 'employer',
      career: 'Ingenieria de Software',
    },
    student: {
      email: `e2e.student2.${runId}@test.com`,
      password: 'Test12345',
      fullName: 'E2E Evert',
      role: 'student',
      career: 'Ingenieria de Software',
    },
  };
  let app: INestApplication<App>;
  let dataSource: DataSource;
  const createdEmails: string[] = [];
  const createdOfferIds: number[] = [];

  // Inicializa la app real y captura el DataSource para limpiar datos.
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  // Limpia usuarios y ofertas creados durante la suite.
  afterAll(async () => {
    if (dataSource) {
      if (createdOfferIds.length > 0) {
        await dataSource
          .getRepository(Offer)
          .delete({ id: In(createdOfferIds) });
      }
      if (createdEmails.length > 0) {
        await dataSource
          .getRepository(User)
          .delete({ email: In(createdEmails) });
      }
    }
    await app.close();
  });

  // Smoke test de la ruta raiz.
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hola Cambada!');
  });

  // Flujo de auth completo: registro, login, refresh y ruta protegida.
  it('auth flow: register, login, refresh, protected route', async () => {
    const { email, password, fullName, role, career } = testUsers.authStudent;
    createdEmails.push(email);

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        fullName,
        role,
        career,
      })
      .expect(200);

    const registerBody = registerResponse.body as AuthResponse;

    expect(registerBody).toHaveProperty('access_token'); //token de acceso para autenticar
    expect(registerBody).toHaveProperty('refresh_token'); //token para renovar el acceso expirado
    expect(registerBody).toHaveProperty('user'); // objeto del usuario creado id, email, rol y carrera

    const userId = registerBody.user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    const loginBody = loginResponse.body as AuthResponse; // verifica que entrega los tokens para autenticar y refresh
    const accessToken = loginBody.access_token;
    const refreshToken = loginBody.refresh_token;

    expect(accessToken).toBeTruthy(); //valida que no este vacio o nulo
    expect(refreshToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        userId,
        refreshToken,
      })
      .expect(200);

    const profileResponse = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profileResponse.body).toHaveProperty('id', userId);
  });

  // Flujo de ofertas: crear como empleador y consultar como estudiante.
  it('flujo de ofertas: empleador puede crear y estudiante obtener ofertas', async () => {
    const employer = testUsers.employer;
    const student = testUsers.student;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: employer.email,
        password: employer.password,
        fullName: employer.fullName,
        role: employer.role,
        career: employer.career,
      })
      .expect(200);
    createdEmails.push(employer.email);

    const employerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: employer.email,
        password: employer.password,
      })
      .expect(200);

    const employerLoginBody = employerLoginResponse.body as AuthResponse;
    const employerToken = employerLoginBody.access_token;

    const offerPayload = {
      title: 'Frontend Intern',
      description: 'E2E offer',
      company: 'TechCorp',
      location: 'COCHABAMBA',
      salary: '1000',
      type: 'Practica',
      career: 'Ingenieria de Software',
    };

    const createOfferResponse = await request(app.getHttpServer())
      .post('/offers')
      .set('Authorization', `Bearer ${employerToken}`)
      .send(offerPayload)
      .expect(201);

    const createdOffer = createOfferResponse.body as OfferResponse;
    expect(createdOffer).toHaveProperty('id');
    expect(createdOffer).toHaveProperty('title', offerPayload.title);

    const offerId = createdOffer.id;
    createdOfferIds.push(offerId);

    await request(app.getHttpServer()).get(`/offers/${offerId}`).expect(200);

    const myOffersResponse = await request(app.getHttpServer())
      .get('/offers/employer/mine')
      .set('Authorization', `Bearer ${employerToken}`)
      .expect(200);

    const myOffers = myOffersResponse.body as OfferResponse[];

    expect(Array.isArray(myOffers)).toBe(true);
    expect(myOffers.some((offer) => offer.id === offerId)).toBe(true);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: student.email,
        password: student.password,
        fullName: student.fullName,
        role: student.role,
        career: student.career,
      })
      .expect(200);
    createdEmails.push(student.email);

    const studentLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: student.email,
        password: student.password,
      })
      .expect(200);

    const studentLoginBody = studentLoginResponse.body as AuthResponse;
    const studentToken = studentLoginBody.access_token;

    const byCareerResponse = await request(app.getHttpServer())
      .get('/offers/career/Ingenieria de Software')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(Array.isArray(byCareerResponse.body)).toBe(true);
  });
});
