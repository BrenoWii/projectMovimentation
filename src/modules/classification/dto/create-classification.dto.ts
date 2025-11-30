import { IsNotEmpty, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassificationDto {
  @IsOptional()
  @IsNotEmpty({ message: 'description é obrigatório' })
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'type é obrigatório' })
  @IsString()
  type: string;

  // link an existing PlanOfBills by id during creation (obrigatório)
  @IsNotEmpty({ message: 'planOfBillId é obrigatório' })
  @Type(() => Number)
  @IsInt({ message: 'planOfBillId deve ser um inteiro' })
  planOfBillId: number;
}
