import { Request } from 'express';
import { UserPayload } from './user-payload.interface';

//interfaces para tipar la request con el usuario
export interface RequestWithUser extends Request {
  user: UserPayload;
}
