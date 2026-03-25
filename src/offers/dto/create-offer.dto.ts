import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  tittle: string;
  @IsString()
  @IsNotEmpty()
  company: string;
  @IsString()
  @IsNotEmpty()
  location: string;
  @IsNumber()
  @Min(0)
  salary: number;
  @IsString()
  @IsNotEmpty()
  employerId: string;
}
