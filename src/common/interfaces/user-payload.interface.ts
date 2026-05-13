import { UserRole } from '../../users/entities/user.entity';

export interface UserPayload {
  sub: string;
  email: string;
  role: UserRole;
  career?: string;
}
