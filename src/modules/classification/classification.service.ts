import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
        const { planOfBillId, description, type } = payload;

        // Valida presença de type e planOfBillId (DTO também valida, mas reforçamos)
        if (!type) {
            throw new BadRequestException('Campo type é obrigatório');
        }
        if (planOfBillId === undefined || planOfBillId === null) {
            throw new BadRequestException('Campo planOfBillId é obrigatório');
        }

        const plan = await this.planOfBillsRepo.findOne(Number(planOfBillId));
        if (!plan) {
            throw new NotFoundException('PlanOfBills não encontrado para id: ' + planOfBillId);
        }

        const classification = this.classificationRepo.create({
            description,
            type,
            planOfBill: plan,
        } as Partial<Classification>);

        return await this.classificationRepo.save(classification);
    }

    async getClassifications(): Promise<Classification[]>{
        return await this.classificationRepo.find({
            relations: ['planOfBill', 'movimentations']
        })
    }


}
