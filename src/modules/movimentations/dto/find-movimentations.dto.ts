import { IsOptional, IsDateString, IsNumberString } from 'class-validator';

export class FindMovimentationsDto {
  // Date range for the movimentation date
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  // Date range for the pay date
  @IsOptional()
  @IsDateString()
  payDateFrom?: string;

  @IsOptional()
  @IsDateString()
  payDateTo?: string;

  // Numeric filters
  @IsOptional()
  @IsNumberString()
  valueMin?: string;

  @IsOptional()
  @IsNumberString()
  valueMax?: string;

  @IsOptional()
  @IsNumberString()
  planOfBillId?: string;

  @IsOptional()
  @IsNumberString()
  classificationId?: string;

  @IsOptional()
  @IsNumberString()
  userId?: string;
}
