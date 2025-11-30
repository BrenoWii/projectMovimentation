import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationService } from './classification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Classification } from './classification.entity';
import { PlanOfBills } from '../plan-of-bills/plan-of-bills.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ClassificationService', () => {
  let service: ClassificationService;
  let classificationRepo: Repository<Classification>;
  let planOfBillsRepo: Repository<PlanOfBills>;

  const mockClassificationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockPlanOfBillsRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassificationService,
        {
          provide: getRepositoryToken(Classification),
          useValue: mockClassificationRepo,
        },
        {
          provide: getRepositoryToken(PlanOfBills),
          useValue: mockPlanOfBillsRepo,
        },
      ],
    }).compile();

    service = module.get<ClassificationService>(ClassificationService);
    classificationRepo = module.get<Repository<Classification>>(getRepositoryToken(Classification));
    planOfBillsRepo = module.get<Repository<PlanOfBills>>(getRepositoryToken(PlanOfBills));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a classification successfully', async () => {
      const dto = {
        description: 'Test Classification',
        type: 'expense',
        planOfBillId: 1,
      };

      const mockPlan = { id: 1, description: 'Test Plan' } as PlanOfBills;
      const mockClassification = {
        id: 1,
        description: dto.description,
        type: dto.type,
        planOfBill: mockPlan,
      } as Classification;

      mockPlanOfBillsRepo.findOne.mockResolvedValue(mockPlan);
      mockClassificationRepo.create.mockReturnValue(mockClassification);
      mockClassificationRepo.save.mockResolvedValue(mockClassification);

      const result = await service.create(dto);

      expect(mockPlanOfBillsRepo.findOne).toHaveBeenCalledWith(1);
      expect(mockClassificationRepo.create).toHaveBeenCalledWith({
        description: dto.description,
        type: dto.type,
        planOfBill: mockPlan,
      });
      expect(result).toEqual(mockClassification);
    });

    it('should throw BadRequestException if type is missing', async () => {
      const dto = {
        description: 'Test',
        type: '',
        planOfBillId: 1,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Campo type é obrigatório');
    });

    it('should throw BadRequestException if planOfBillId is missing', async () => {
      const dto = {
        description: 'Test',
        type: 'expense',
        planOfBillId: null as any,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Campo planOfBillId é obrigatório');
    });

    it('should throw NotFoundException if PlanOfBills not found', async () => {
      const dto = {
        description: 'Test',
        type: 'expense',
        planOfBillId: 999,
      };

      mockPlanOfBillsRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow('PlanOfBills não encontrado para id: 999');
    });

    it('should create classification without description (optional)', async () => {
      const dto = {
        type: 'income',
        planOfBillId: 2,
      };

      const mockPlan = { id: 2 } as PlanOfBills;
      const mockClassification = { id: 1, type: dto.type, planOfBill: mockPlan } as Classification;

      mockPlanOfBillsRepo.findOne.mockResolvedValue(mockPlan);
      mockClassificationRepo.create.mockReturnValue(mockClassification);
      mockClassificationRepo.save.mockResolvedValue(mockClassification);

      const result = await service.create(dto);

      expect(result.type).toBe('income');
      expect(result.planOfBill.id).toBe(2);
    });
  });

  describe('getClassifications', () => {
    it('should return all classifications with relations', async () => {
      const mockClassifications = [
        { id: 1, type: 'expense', planOfBill: {}, movimentations: [] },
        { id: 2, type: 'income', planOfBill: {}, movimentations: [] },
      ] as Classification[];

      mockClassificationRepo.find.mockResolvedValue(mockClassifications);

      const result = await service.getClassifications();

      expect(mockClassificationRepo.find).toHaveBeenCalledWith({
        relations: ['planOfBill', 'movimentations'],
      });
      expect(result).toEqual(mockClassifications);
      expect(result.length).toBe(2);
    });

    it('should return empty array if no classifications exist', async () => {
      mockClassificationRepo.find.mockResolvedValue([]);

      const result = await service.getClassifications();

      expect(result).toEqual([]);
    });
  });
});
