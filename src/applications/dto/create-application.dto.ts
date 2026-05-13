import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  // studentId ya no viene del body — lo inyecta el controller desde el JWT
  @IsNotEmpty()
  @Type(() => Number)
  offerId: number;
}
