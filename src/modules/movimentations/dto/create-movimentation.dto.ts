import { Classification } from "../../classification/classification.entity";
import { User } from "../../users/user.entity";
import { IsDateString, IsNotEmpty, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovimentationDto {
  @IsNotEmpty()
  @IsDateString()
  date: string; // recebido como string ISO YYYY-MM-DD ou completa

  @IsNotEmpty()
  @IsNumber({}, { message: 'value deve ser numérico (reais)' })
  @Type(() => Number)
  value: number; // após transformação sempre number

  @ValidateNested()
  @Type(() => Classification)
  classification: Classification;

  // Injetado pelo backend; não precisa validar entrada
  user: User;

    @IsOptional()
    @IsDateString()
    payDate?: string;
  }
