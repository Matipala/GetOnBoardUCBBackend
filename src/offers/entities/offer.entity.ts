import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tittle: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column()
  salary: number;

  @Column()
  employerId: string;

  @CreateDateColumn()
  createdAt: Date;
}
