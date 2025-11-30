import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateMappingDto {
  @IsOptional()
  @IsString()
  extractDescription?: string;

  @IsOptional()
  @IsInt()
  classificationId?: number;
}
