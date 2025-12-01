import { IsNotEmpty, IsNumber, IsInt, IsOptional, IsIn, ValidateNested, IsBoolean, IsString, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { IsDateOrIsoStringValidator } from '../../../common/validators/is-date-or-iso-string.validator';

export class BulkMovimentationItemDto {
  @IsNotEmpty()
  @Validate(IsDateOrIsoStringValidator)
  date: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsInt()
  classificationId: number;

  @IsOptional()
  @Validate(IsDateOrIsoStringValidator)
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
