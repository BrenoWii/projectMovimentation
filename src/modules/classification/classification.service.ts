import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classification } from './classification.entity';
import { CreateClassificationDto } from './dto';
import { PlanOfBills } from '../plan-of-bills/plan-of-bills.entity';

@Injectable()
export class ClassificationService {
    constructor(
        @InjectRepository(Classification)
        private readonly classificationRepo: Repository<Classification>,
        @InjectRepository(PlanOfBills)
        private readonly planOfBillsRepo: Repository<PlanOfBills>,
    ) {}

    async create(payload: CreateClassificationDto): Promise<Classification>{
        const { planOfBillId, ...rest } = payload;
        const classification = this.classificationRepo.create(rest as Partial<Classification>);
        if (planOfBillId) {
            const plan = await this.planOfBillsRepo.findOne(Number(planOfBillId));
            if (plan) {
                (classification as any).planOfBill = plan;
            }
        }
        return await this.classificationRepo.save(classification);
    }

    async getClassifications(): Promise<Classification[]>{
        return await this.classificationRepo.find({
            relations: ['planOfBill', 'movimentations']
        })
    }


}
