/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AppModule } from '../app.module';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

// Datos base para registrar un usuario de prueba.
const createUserPayload = () => ({
  email: `pruebaunitaria@test.com`,
  password: 'Test12345',
  fullName: `Matias Prueba`,
  role: 'student' as const,
  career: 'Ingenieria de Software',
});

describe('AuthService (integration)', () => {
  jest.setTimeout(20000);

  let moduleRef: TestingModule; //Contiene el módulo de pruebas.
  let authService: AuthService; //Instancia real del servicio.
  let dataSource: DataSource; //Conexión a PostgreSQL.
  let createdEmails: string[] = []; //Lista de usuarios creados para eliminarlos después.

  // Inicializa el modulo completo y la conexion a la BD real.
  beforeAll(async () => {
    process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'postgres';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    process.env.DB_NAME = process.env.DB_NAME || 'getonboard_test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
    moduleRef = await Test.createTestingModule({
      imports: [AppModule], //crea el modulo y carga toda la aplicación.
    }).compile();

    authService = moduleRef.get(AuthService); //obtenemos dependencias reales del servicio
    dataSource = moduleRef.get(DataSource); // y de la base de datos
  });

  // Limpia los usuarios creados en cada test.
  afterEach(async () => {
    if (createdEmails.length === 0) return;
    const repo = dataSource.getRepository(User);
    await repo.delete({ email: In(createdEmails) });
    createdEmails = [];
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close(); //cierra la aplicacion al final
    }
  });

  // Registro completo con retorno de tokens y datos del usuario.
  it('registra y devuelve tokens + usuario', async () => {
    const payload = createUserPayload();
    createdEmails.push(payload.email);

    const result = await authService.signUp(
      payload.email,
      payload.password,
      payload.fullName,
      payload.role,
      payload.career,
    );

    expect(result.access_token).toBeTruthy();
    expect(result.refresh_token).toBeTruthy();
    expect(result.user.email).toBe(payload.email);
  });

  // Login correcto con tokens de acceso y refresh.
  it('inicia sesion con credenciales correctas', async () => {
    const payload = createUserPayload();
    createdEmails.push(payload.email);

    await authService.signUp(
      payload.email,
      payload.password,
      payload.fullName,
      payload.role,
      payload.career,
    );

    const result = await authService.signIn(payload.email, payload.password);

    expect(result.access_token).toBeTruthy();
    expect(result.refresh_token).toBeTruthy();
    expect(result.user.email).toBe(payload.email);
  });

  // Login invalido debe responder con Unauthorized.
  it('rechaza inicio de sesion con contrasena incorrecta', async () => {
    const payload = createUserPayload();
    createdEmails.push(payload.email);

    await authService.signUp(
      payload.email,
      payload.password,
      payload.fullName,
      payload.role,
      payload.career,
    );

    await expect(
      authService.signIn(payload.email, 'BadPass123'),
    ).rejects.toThrow(UnauthorizedException); //credenciales incorrectas.
  });

  // Refresh valido devuelve nuevos tokens.
  it('refresca tokens cuando el refresh es valido', async () => {
    const payload = createUserPayload();
    createdEmails.push(payload.email);

    const signUpResult = await authService.signUp(
      payload.email,
      payload.password,
      payload.fullName,
      payload.role,
      payload.career,
    );

    const refreshResult = await authService.refreshTokens(
      signUpResult.user.id, //llama el refresh con el id del usuario creado al registrarse
      signUpResult.refresh_token, // y el refresh tambien
    );

    expect(refreshResult.access_token).toBeTruthy(); //valida el acceso
    expect(refreshResult.refresh_token).toBeTruthy(); //y aqui valida el token generando nuevos tokens
  });

  // Refresh invalido debe responder con Forbidden.
  it('bloquea refresh si el token es invalido', async () => {
    const payload = createUserPayload();
    createdEmails.push(payload.email);

    const signUpResult = await authService.signUp(
      payload.email,
      payload.password,
      payload.fullName,
      payload.role,
      payload.career,
    );

    await expect(
      authService.refreshTokens(signUpResult.user.id, 'invalid-refresh'),
    ).rejects.toThrow(ForbiddenException); //acceso prohibido.
  });
});
