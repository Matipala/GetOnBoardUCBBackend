import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'cv_url', type: 'text' })
  cvUrl: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'offer_id' })
  offerId: number;

  @ManyToOne(() => Offer)
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
