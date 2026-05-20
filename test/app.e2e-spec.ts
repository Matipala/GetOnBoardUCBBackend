/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  career: string | null;
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUserResponse;
};

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
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hola Cambada!');
  });

  it('auth flow: register, login, refresh, protected route', async () => {
    const uniqueEmail = `e2e_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}@test.com`;
    const password = 'Test12345!';

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password,
        fullName: 'E2E User',
        role: 'student',
        career: 'Ingenieria',
      })
      .expect(200);

    const registerBody = registerResponse.body as AuthResponse;

    expect(registerBody).toHaveProperty('access_token');
    expect(registerBody).toHaveProperty('refresh_token');
    expect(registerBody).toHaveProperty('user');

    const userId = registerBody.user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password,
      })
      .expect(200);

    const loginBody = loginResponse.body as AuthResponse;
    const accessToken = loginBody.access_token;
    const refreshToken = loginBody.refresh_token;

    expect(accessToken).toBeTruthy();
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

  it('flujo de ofertas: empleador puede crear y obtener ofertas', async () => {
    const employerEmail = `e2e_employer_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}@test.com`;
    const studentEmail = `e2e_student_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}@test.com`;
    const password = 'Test12345!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: employerEmail,
        password,
        fullName: 'E2E Employer',
        role: 'employer',
        career: 'Ingenieria',
      })
      .expect(200);

    const employerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: employerEmail,
        password,
      })
      .expect(200);

    const employerLoginBody = employerLoginResponse.body as AuthResponse;
    const employerToken = employerLoginBody.access_token;

    const offerPayload = {
      title: 'Backend Intern',
      description: 'E2E offer test',
      company: 'E2E Co',
      location: 'La Paz',
      salary: '1000',
      type: 'Practica',
      career: 'Ingenieria',
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
        email: studentEmail,
        password,
        fullName: 'E2E Student',
        role: 'student',
        career: 'Ingenieria',
      })
      .expect(200);

    const studentLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: studentEmail,
        password,
      })
      .expect(200);

    const studentLoginBody = studentLoginResponse.body as AuthResponse;
    const studentToken = studentLoginBody.access_token;

    const byCareerResponse = await request(app.getHttpServer())
      .get('/offers/career/Ingenieria')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(Array.isArray(byCareerResponse.body)).toBe(true);
  });
});
