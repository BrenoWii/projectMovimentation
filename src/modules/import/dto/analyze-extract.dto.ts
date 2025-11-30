import { IsOptional, IsString } from 'class-validator';

export class AnalyzeExtractDto {
  @IsOptional()
  @IsString()
  csvContent?: string;
}
