import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Application } from '../../applications/entities/application.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salary: string;

  @Column({ type: 'varchar', length: 50, default: 'Practica' })
  type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  career: string;

  @Column({ name: 'employerid', nullable: true })
  employerId: string;

  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;

  @OneToMany(() => Application, (application) => application.offer)
  applications: Application[];
}
