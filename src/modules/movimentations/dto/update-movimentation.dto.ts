import { IsOptional, IsDateString, IsNumber, IsInt, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../movimentation.entity';

export class UpdateMovimentationDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  payDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'value deve ser numérico (reais)' })
  @Type(() => Number)
  value?: number;

  // Recebe id da classification para atualizar relação
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classificationId?: number;

  @IsOptional()
  @IsIn(Object.values(PaymentMethod), { message: 'paymentMethod inválido' })
  paymentMethod?: PaymentMethod;
}
