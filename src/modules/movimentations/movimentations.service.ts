import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovimentationDto, FindMovimentationsDto, UpdateMovimentationDto } from './dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Movimentation } from './movimentation.entity';
@Injectable()
export class MovimentationsService {
    constructor(
        @InjectRepository(Movimentation)
        private readonly movimentationRepo: Repository<Movimentation>,
    ) {}

    async getAllMovimentations(filters?: FindMovimentationsDto, userId?: number): Promise<Movimentation[]> {
        // Build a flexible query with optional filters and include relations
            const qb = this.movimentationRepo
                .createQueryBuilder('m')
                .leftJoinAndSelect('m.classification', 'c')
                .leftJoinAndSelect('m.user', 'u');

        // Always filter by user if provided
        if (userId) {
            qb.andWhere('u.id = :userId', { userId });
        }

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
        }

        return qb.getMany();
    }

    async getMovimentationById(id: number, userId?: number): Promise<Movimentation> {
        const query: any = { id };
        if (userId) {
            query.user = { id: userId };
        }
        return this.movimentationRepo.findOne(query);
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
            user: movimentation.user,
            paymentMethod: (movimentation as any).paymentMethod
        };

        return await this.movimentationRepo.save(
            this.movimentationRepo.create(toSave),
        );
    }

    async update(id: number, dto: UpdateMovimentationDto): Promise<Movimentation> {
        const existing = await this.movimentationRepo.findOne(id);
        if (!existing) throw new NotFoundException('Movimentation não encontrada: ' + id);

        const normalizeDate = (input: any): Date | undefined => {
            if (!input) return undefined;
            if (input instanceof Date) return input;
            if (typeof input === 'string') {
                const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
                if (dateOnly.test(input)) {
                    const [y, m, d] = input.split('-').map(Number);
                    return new Date(y, m - 1, d);
                }
                const tIndex = input.indexOf('T');
                if (tIndex > 0) {
                    const datePart = input.substring(0, tIndex);
                    const [y, m, d] = datePart.split('-').map(Number);
                    if (y && m && d) return new Date(y, m - 1, d);
                }
                const parsed = new Date(input);
                if (!isNaN(parsed.getTime())) return parsed;
            }
            throw new BadRequestException('Formato de data inválido: ' + input);
        };

        const toUpdate: Partial<Movimentation> = {};
        if (dto.date !== undefined) {
            toUpdate.date = normalizeDate(dto.date);
        }
        if (dto.payDate !== undefined) {
            toUpdate.payDate = normalizeDate(dto.payDate);
        }
        if (dto.value !== undefined) {
            const v = Number(dto.value);
            if (isNaN(v)) throw new BadRequestException('Valor inválido para value');
            toUpdate.value = Math.round(v * 100);
        }
        if (dto.classificationId !== undefined) {
            // assign relation by id
            (toUpdate as any).classification = { id: dto.classificationId };
        }
        if (dto.paymentMethod !== undefined) {
            toUpdate.paymentMethod = dto.paymentMethod;
        }

        const merged = this.movimentationRepo.merge(existing, toUpdate);
        return await this.movimentationRepo.save(merged);
    }
}
