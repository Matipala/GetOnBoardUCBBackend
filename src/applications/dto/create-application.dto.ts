import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNotEmpty()
  offerId: number;
}
