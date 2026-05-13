import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
  ) {}

  async create(createOfferDto: CreateOfferDto, employerId: string) {
    const offer = this.offersRepository.create({
      ...createOfferDto,
      employerId,
    });
    return await this.offersRepository.save(offer);
  }

  async findAll() {
    return await this.offersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const offer = await this.offersRepository.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Oferta no encontrada');
    return offer;
  }

  async findByEmployer(employerId: string) {
    return await this.offersRepository.find({
      where: { employerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCareer(career: string) {
    return await this.offersRepository.find({
      where: { career },
      relations: ['applications'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
    userId: string,
    role: string,
  ) {
    const offer = await this.findOne(id);
    if (role !== 'admin' && offer.employerId !== userId) {
      throw new ForbiddenException('No puedes editar esta oferta');
    }
    await this.offersRepository.update(id, updateOfferDto);
    return this.findOne(id);
  }

  async remove(id: number, userId: string, role: string) {
    const offer = await this.findOne(id);
    if (role !== 'admin' && offer.employerId !== userId) {
      throw new ForbiddenException('No puedes eliminar esta oferta');
    }
    await this.offersRepository.delete(id);
    return { deleted: true };
  }

  async getStats() {
    const total = await this.offersRepository.count();
    return { total };
  }
}
