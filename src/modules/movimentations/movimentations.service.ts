import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovimentationDto, FindMovimentationsDto } from './dto';
import { Movimentation } from './movimentation.entity';
@Injectable()
export class MovimentationsService {
    constructor(
        @InjectRepository(Movimentation)
        private readonly movimentationRepo: Repository<Movimentation>,
    ) {}

    async getAllMovimentations(filters?: FindMovimentationsDto): Promise<Movimentation[]> {
        // Build a flexible query with optional filters and include relations
            const qb = this.movimentationRepo
                .createQueryBuilder('m')
                .leftJoinAndSelect('m.planOfBill', 'p')
                .leftJoinAndSelect('p.classification', 'c');

        if (filters) {
            const {
                dateFrom,
                dateTo,
                payDateFrom,
                payDateTo,
                valueMin,
                        valueMax,
                        planOfBillId,
                        classificationId,
            } = filters;

            if (dateFrom) {
                qb.andWhere('m.date >= :dateFrom', { dateFrom });
            }
            if (dateTo) {
                qb.andWhere('m.date <= :dateTo', { dateTo });
            }
            if (payDateFrom) {
                qb.andWhere('m.payDate >= :payDateFrom', { payDateFrom });
            }
            if (payDateTo) {
                qb.andWhere('m.payDate <= :payDateTo', { payDateTo });
            }
            if (valueMin) {
                qb.andWhere('m.value >= :valueMin', { valueMin: Number(valueMin) });
            }
            if (valueMax) {
                qb.andWhere('m.value <= :valueMax', { valueMax: Number(valueMax) });
            }
            if (planOfBillId) {
                qb.andWhere('p.id = :planOfBillId', { planOfBillId: Number(planOfBillId) });
            }
            if (classificationId) {
                qb.andWhere('c.id = :classificationId', { classificationId: Number(classificationId) });
            }
                    // Note: user relation is OneToOne without explicit JoinColumn; avoid join to prevent TypeORM joinColumns error
                    // If needed later, switch to ManyToOne or add @JoinColumn() on Movimentation.user and then enable the join/filter here.
        }

        return qb.getMany();
    }

    async getMovimentationById(id: number): Promise<Movimentation> {
        return this.movimentationRepo.findOne(id);
    }

    async create(movimentation: CreateMovimentationDto): Promise<Movimentation> {
        return await this.movimentationRepo.save(
            this.movimentationRepo.create(movimentation),
        );
    }
}
