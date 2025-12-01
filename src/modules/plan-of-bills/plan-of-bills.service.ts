import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanOfBillsDto, UpdatePlanOfBillsDto } from './dto';
import { PlanOfBills } from './plan-of-bills.entity';

@Injectable()
export class PlanOfBillsService {
    constructor(@InjectRepository(PlanOfBills)private readonly planOfBillsRepo: Repository<PlanOfBills>){}

    async create(planOfBills: CreatePlanOfBillsDto): Promise<PlanOfBills>{
        const dto = {
            ...planOfBills,
            description: planOfBills.description.trim()
        };
        return await this.planOfBillsRepo.save(this.planOfBillsRepo.create(dto))
    }
    
    async getPlanOfBills(){
        return await this.planOfBillsRepo.find({
            relations: ['classifications']
        })
    }

    async updateDescription(id: number, dto: UpdatePlanOfBillsDto): Promise<PlanOfBills> {
        const plan = await this.planOfBillsRepo.findOne(id);
        if (!plan) {
            throw new NotFoundException('PlanOfBills not found');
        }
        plan.description = dto.description.trim();
        return await this.planOfBillsRepo.save(plan);
    }

    async getPlanOfBillsById(id: number): Promise<PlanOfBills> {
        const plan = await this.planOfBillsRepo.findOne(id, { relations: ['classifications'] });
        if (!plan) {
            throw new NotFoundException('PlanOfBills not found');
        }
        return plan;
    }
}
