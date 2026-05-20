/// <reference types="jest" />

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './entities/offer.entity';
import type { Repository } from 'typeorm';

describe('OffersService', () => {
  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  });

  it('crea una oferta con el identificador del empleador', async () => {
    const repository = mockRepository();
    const service = new OffersService(repository as Repository<Offer>);

    const payload = {
      title: 'Dev Intern',
      description: 'Test',
      company: 'Test Co',
      location: 'SCZ',
      salary: '1000',
      type: 'Practica',
      career: 'Ingenieria',
    };
    repository.create.mockReturnValue({ ...payload, employerId: 'emp-1' });
    repository.save.mockResolvedValue({
      ...payload,
      id: 1,
      employerId: 'emp-1',
    });
    const result = await service.create(payload, 'emp-1'); //crear oferta

    expect(repository.create).toHaveBeenCalledWith({
      ...payload,
      employerId: 'emp-1',
    });
    expect(repository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('employerId', 'emp-1');
  });

  it('lanza un error cuando no se encuentra la oferta', async () => {
    const repository = mockRepository();
    const service = new OffersService(repository as Repository<Offer>);

    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('bloquea la actualización si no es el propietario y no es admin', async () => {
    const repository = mockRepository();
    const service = new OffersService(repository as Repository<Offer>);

    repository.findOne.mockResolvedValue({
      id: 1,
      employerId: 'emp-1',
    });

    await expect(
      service.update(1, { title: 'New' }, 'emp-2', 'employer'),
    ).rejects.toThrow(ForbiddenException);
  });
});
