import { IsNotEmpty, IsDateString, IsNumber, IsInt, IsOptional, IsIn, ValidateNested, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkMovimentationItemDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsInt()
  classificationId: number;

  @IsOptional()
  @IsDateString()
  payDate?: string;

  @IsOptional()
  @IsIn(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'MONEY', 'TED'])
  paymentMethod?: string;
  
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class BulkCreateDto {
  @ValidateNested({ each: true })
  @Type(() => BulkMovimentationItemDto)
  items: BulkMovimentationItemDto[];

  @IsOptional()
  @IsBoolean()
  learnFromImport?: boolean;
}
