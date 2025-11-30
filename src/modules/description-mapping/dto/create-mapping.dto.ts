import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateMappingDto {
  @IsNotEmpty()
  @IsString()
  extractDescription: string;

  @IsNotEmpty()
  @IsInt()
  classificationId: number;
}
