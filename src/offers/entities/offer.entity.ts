import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  tittle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salary: string;

  @Column({ type: 'varchar', length: 50, default: 'Practica' })
  type: string;

  @Column({ name: 'employerid', nullable: true })
  employerId: string;

  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;
}
