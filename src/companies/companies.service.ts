import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { CloudinaryService } from '../applications/cloudinary.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, createCompanyDto: CreateCompanyDto) {
    const existing = await this.companyRepository.findOne({
      where: { userId },
    });
    if (existing) {
      Object.assign(existing, createCompanyDto);
      return this.companyRepository.save(existing);
    }
    const company = this.companyRepository.create({
      ...createCompanyDto,
      userId,
    });
    return this.companyRepository.save(company);
  }

  async findMyCompany(userId: string) {
    const company = await this.companyRepository.findOne({ where: { userId } });
    if (!company) {
      throw new NotFoundException(
        'Perfil de la empresa no encontrado para este usuario',
      );
    }
    return company;
  }

  async updateMyCompany(userId: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyRepository.findOne({ where: { userId } });
    if (!company) {
      return this.create(userId, updateCompanyDto as CreateCompanyDto);
    }
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async findByEmployerId(employerId: string) {
    return this.companyRepository.findOne({ where: { userId: employerId } });
  }

  async uploadLogo(userId: string, file: Express.Multer.File) {
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    if ('message' in uploadResult) {
      throw new BadRequestException('Error al subir el logo');
    }
    const logoUrl: string = uploadResult.secure_url;

    let company = await this.companyRepository.findOne({ where: { userId } });
    if (!company) {
      company = this.companyRepository.create({
        userId,
        logo: logoUrl,
        name: 'Empresa ' + userId.substring(0, 4),
      });
    } else {
      company.logo = logoUrl;
    }

    return this.companyRepository.save(company);
  }
}
