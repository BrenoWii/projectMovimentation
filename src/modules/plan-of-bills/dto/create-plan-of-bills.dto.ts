import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePlanOfBillsDto {
    @IsString()
    @IsNotEmpty()
    description: string;
}
