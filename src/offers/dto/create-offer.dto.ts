import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

  @IsString()
  @IsOptional()
  salary?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  employerId?: string;
}
