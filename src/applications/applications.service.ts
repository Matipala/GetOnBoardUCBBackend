import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Application } from './entities/application.entity';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly cloudinaryService: CloudinaryService, // Para subir archivos
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de CV es obligatorio');
    }

    const existingApplication = await this.applicationRepository.findOne({
      where: {
        studentId: createApplicationDto.studentId,
        offerId: createApplicationDto.offerId,
      },
    });

    if (existingApplication) {
      throw new ConflictException(
        'Ya te has postulado a esta oferta anteriormente',
      );
    }

    const uploadResult = await this.cloudinaryService.uploadFile(file);

    if ('secure_url' in uploadResult) {
      const application = this.applicationRepository.create({
        ...createApplicationDto,
        cvUrl: uploadResult.secure_url as string,
        status: 'PENDING',
      });

      return await this.applicationRepository.save(application);
    }

    throw new BadRequestException('Error al subir el archivo a Cloudinary');
  }

  async findAllByOffer(offerId: number) {
    return await this.applicationRepository.find({
      where: { offerId },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByStudent(studentId: string) {
    return await this.applicationRepository.find({
      where: { studentId },
      relations: ['offer'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED',
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new BadRequestException('La postulación no existe');
    }
    application.status = status;
    return await this.applicationRepository.save(application);
  }
}
