/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AppModule } from '../app.module';
import { OffersService } from './offers.service';
import { Offer } from './entities/offer.entity';

// Datos base para registrar una oferta de prueba.
const createOfferPayload = () => ({
  title: `Desarrollo Backend`,
  description: 'Test offer',
  company: 'Test Corp',
  location: 'Cochabamba',
  salary: '2000',
  type: 'Practica',
  career: 'Ingenieria de Software',
});

describe('OffersService (integration)', () => {
  jest.setTimeout(20000);

  let moduleRef: TestingModule;
  let offersService: OffersService;
  let dataSource: DataSource;
  let createdOfferIds: number[] = [];

  // Inicializa el modulo completo y la conexion a la BD real.
  beforeAll(async () => {
    process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'root';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || '12345';
    process.env.DB_NAME = process.env.DB_NAME || 'getonboard';

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    offersService = moduleRef.get(OffersService);
    dataSource = moduleRef.get(DataSource);
  });

  // Limpia las ofertas creadas en cada test.
  afterEach(async () => {
    if (createdOfferIds.length === 0) return;
    const repo = dataSource.getRepository(Offer);
    await repo.delete({ id: In(createdOfferIds) });
    createdOfferIds = [];
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  // Crea una oferta y valida que se persista con employerId.
  it('crea una oferta con el identificador del empleador', async () => {
    const payload = createOfferPayload();

    const result = await offersService.create(payload, 'emp-1');
    createdOfferIds.push(result.id);

    expect(result).toHaveProperty('id');
    expect(result.employerId).toBe('emp-1');
    expect(result.title).toBe(payload.title);
  });

  // Buscar una oferta inexistente debe retornar NotFound.
  it('lanza un error cuando no se encuentra la oferta', async () => {
    await expect(offersService.findOne(999999)).rejects.toThrow(
      NotFoundException,
    );
  });

  // Evita cambios si el usuario no es duenho ni admin.
  it('bloquea la actualizacion si no es el propietario y no es admin', async () => {
    const payload = createOfferPayload();
    const created = await offersService.create(payload, 'emp-1');
    createdOfferIds.push(created.id);

    await expect(
      offersService.update(created.id, { title: 'New' }, 'emp-2', 'employer'),
    ).rejects.toThrow(ForbiddenException);
  });
});
