import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdatePlanOfBillsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}
