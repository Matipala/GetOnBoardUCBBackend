import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole =
  | 'admin'
  | 'student'
  | 'employer'
  | 'coordinator'
  | 'Usuario';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  @Column({ default: 'Usuario' })
  role: UserRole;
}
