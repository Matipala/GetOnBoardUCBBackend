import { Injectable } from '@nestjs/common';
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

  async create(createOfferDto: CreateOfferDto) {
    const offer = this.offersRepository.create(createOfferDto);
    return await this.offersRepository.save(offer);
  }

  async findAll() {
    return await this.offersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.offersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateOfferDto: UpdateOfferDto) {
    await this.offersRepository.update(id, updateOfferDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.offersRepository.delete(id);
    return { deleted: true };
  }
}
