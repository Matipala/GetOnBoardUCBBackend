import { UserRole } from '../../users/entities/user.entity';
//defino que datos forma los datos del JWT
export interface UserPayload {
  sub: string;
  email: string;
  role: UserRole;
  career?: string;
}
