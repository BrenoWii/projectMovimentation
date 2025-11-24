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
                .leftJoinAndSelect('m.classification', 'c');

        if (filters) {
            const {
                dateFrom,
                dateTo,
                payDateFrom,
                payDateTo,
                valueMin,
                        valueMax,
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
        console.log('Creating movimentation:', movimentation);

        // Normalização de datas (date e payDate) evitando shift de timezone para formato YYYY-MM-DD
        const normalizeDate = (input: any): Date | undefined => {
            if (!input) return undefined;
            if (input instanceof Date) return input;
            if (typeof input === 'string') {
                const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
                if (dateOnly.test(input)) {
                    const [y, m, d] = input.split('-').map(Number);
                    return new Date(y, m - 1, d); // cria data local sem offset UTC
                }
                // Se for ISO com hora (ex: 2025-11-23T00:00:00Z) considerar apenas a parte de data
                const tIndex = input.indexOf('T');
                if (tIndex > 0) {
                    const datePart = input.substring(0, tIndex);
                    const [y, m, d] = datePart.split('-').map(Number);
                    if (y && m && d) return new Date(y, m - 1, d);
                }
                const parsed = new Date(input);
                if (!isNaN(parsed.getTime())) return parsed;
            }
            throw new Error('Formato de data inválido: ' + input);
        };

        const normalizedDate = normalizeDate(movimentation.date);
        if (!normalizedDate) {
            throw new Error('Campo date é obrigatório e não foi fornecido.');
        }
        const normalizedPayDate = normalizeDate(movimentation.payDate);

        // Converte valor recebido em reais para centavos (inteiro)
        let valueInReais = movimentation.value;
        if (typeof valueInReais !== 'number') {
            valueInReais = Number(valueInReais);
        }
        if (isNaN(valueInReais)) {
            throw new Error('Valor inválido para movimentation.value');
        }
        const valueInCentavos = Math.round(valueInReais * 100);

        const toSave: Partial<Movimentation> = {
            date: normalizedDate,
            payDate: normalizedPayDate,
            value: valueInCentavos,
            classification: movimentation.classification,
            user: movimentation.user
        };

        return await this.movimentationRepo.save(
            this.movimentationRepo.create(toSave),
        );
    }
}
