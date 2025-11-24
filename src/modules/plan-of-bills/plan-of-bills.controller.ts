import { Body, Controller, Post, Get, Patch, Param } from '@nestjs/common';
import { CreatePlanOfBillsDto, UpdatePlanOfBillsDto } from './dto';
import { PlanOfBillsService } from './plan-of-bills.service';

@Controller('api/plan-of-bills')
export class PlanOfBillsController {
    constructor(private readonly planOfBillsService: PlanOfBillsService){}

    @Get()
    async getClassifications(){
        return this.planOfBillsService.getPlanOfBills()
    }

    @Get(':id')
    async getPlanOfBill(@Param('id') id: string){
        return this.planOfBillsService.getPlanOfBillsById(Number(id));
    }

    @Post()
    async create(@Body() createPlanOfBillsDto: CreatePlanOfBillsDto){
       return this.planOfBillsService.create(createPlanOfBillsDto)
    }

    @Patch(':id')
    async updateDescription(
        @Param('id') id: string,
        @Body() updateDto: UpdatePlanOfBillsDto
    ) {
        return this.planOfBillsService.updateDescription(Number(id), updateDto);
    }

}
