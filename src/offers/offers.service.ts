import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offer = this.offersRepository.create(createOfferDto);
    return await this.offersRepository.save(offer);
  }

  async findAll(): Promise<Offer[]> {
    return await this.offersRepository.find();
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id },
    });
    if (!offer) {
      throw new NotFoundException(`Oferta con Id${id} no encontrada`);
    }
    return offer;
  }

  async remove(id: string): Promise<void> {
    const offer = await this.findOne(id);
    await this.offersRepository.remove(offer);
  }
}
