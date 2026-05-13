import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

import { OffersService } from '../offers/offers.service';
import { ApplicationsService } from '../applications/applications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private offersService: OffersService,
    private applicationsService: ApplicationsService,
  ) {}
  //uso de bcrypt.hash para cifrar las contraseñas
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) throw new ConflictException('El correo ya está registrado');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    const user = this.usersRepository.create({
      ...createUserDto,
      role: (createUserDto.role as UserRole) ?? 'student',
      password: hashedPassword,
    });
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findAll(career?: string): Promise<User[]> {
    const where = career ? { career } : {};
    return await this.usersRepository.find({ where });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id); // lanza 404 si no existe
    await this.usersRepository.update(id, dto);
    return this.findOne(id);
  }

  async assignRole(id: string, role: UserRole): Promise<User> {
    await this.findOne(id);
    await this.usersRepository.update(id, { role });
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<User> {
    await this.findOne(id);
    await this.usersRepository.update(id, { isActive: false });
    return this.findOne(id);
  }

  async reactivate(id: string): Promise<User> {
    await this.findOne(id);
    await this.usersRepository.update(id, { isActive: true });
    return this.findOne(id);
  }

  async getStats(): Promise<Record<string, number>> {
    const [students, employers, coordinators, admins, total] =
      await Promise.all([
        this.usersRepository.count({ where: { role: 'student' } }),
        this.usersRepository.count({ where: { role: 'employer' } }),
        this.usersRepository.count({ where: { role: 'coordinator' } }),
        this.usersRepository.count({ where: { role: 'admin' } }),
        this.usersRepository.count(),
      ]);
    return { students, employers, coordinators, admins, total };
  }

  async getCoordinatorStats(career: string): Promise<Record<string, number>> {
    const students = await this.usersRepository.count({
      where: { role: 'student' as UserRole, career },
    });

    const offers = await this.offersService.findByCareer(career);
    const offersCount = offers.length;

    const studentList = await this.usersRepository.find({
      where: { role: 'student' as UserRole, career },
      select: ['id'],
    });
    const studentIds = studentList.map((s) => s.id);

    const pendingReports =
      await this.applicationsService.countPendingByStudents(studentIds);

    return {
      students,
      offers: offersCount,
      pendingReports,
      managedCareers: 1,
    };
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    if (refreshToken) {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.usersRepository.update(id, { hashedRefreshToken });
    } else {
      await this.usersRepository.update(id, { hashedRefreshToken: null });
    }
  }
}
