import { Test, TestingModule } from '@nestjs/testing';
import { MovimentationsService } from './movimentations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movimentation, PaymentMethod } from './movimentation.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MovimentationsService', () => {
  let service: MovimentationsService;
  let repository: Repository<Movimentation>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimentationsService,
        {
          provide: getRepositoryToken(Movimentation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MovimentationsService>(MovimentationsService);
    repository = module.get<Repository<Movimentation>>(getRepositoryToken(Movimentation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a movimentation with value converted to centavos', async () => {
      const dto = {
        date: '2025-11-23',
        value: 150,
        classification: { id: 1 } as any,
        user: { id: 1 } as any,
        payDate: '2025-11-23',
        paymentMethod: PaymentMethod.PIX,
      };

      const mockSaved = { id: 1, ...dto, value: 15000 };
      mockRepository.create.mockReturnValue(mockSaved);
      mockRepository.save.mockResolvedValue(mockSaved);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 15000, // 150 * 100
          paymentMethod: PaymentMethod.PIX,
        })
      );
      expect(result).toEqual(mockSaved);
    });

    it('should normalize ISO date with time to local date', async () => {
      const dto = {
        date: '2025-11-23T00:00:00Z',
        value: 100,
        classification: { id: 1 } as any,
        user: { id: 1 } as any,
      };

      const mockSaved = { id: 1, ...dto };
      mockRepository.create.mockReturnValue(mockSaved);
      mockRepository.save.mockResolvedValue(mockSaved);

      await service.create(dto);

      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.date).toBeInstanceOf(Date);
      expect(createCall.date.getFullYear()).toBe(2025);
      expect(createCall.date.getMonth()).toBe(10); // novembro = 10
      expect(createCall.date.getDate()).toBe(23);
    });

    it('should throw error if date is missing', async () => {
      const dto = {
        date: null as any,
        value: 100,
        classification: { id: 1 } as any,
        user: { id: 1 } as any,
      };

      await expect(service.create(dto)).rejects.toThrow('Campo date é obrigatório');
    });

    it('should throw error if value is invalid', async () => {
      const dto = {
        date: '2025-11-23',
        value: NaN,
        classification: { id: 1 } as any,
        user: { id: 1 } as any,
      };

      await expect(service.create(dto)).rejects.toThrow('Valor inválido');
    });

    it('should handle string value and convert to centavos', async () => {
      const dto = {
        date: '2025-11-23',
        value: '99.99' as any,
        classification: { id: 1 } as any,
        user: { id: 1 } as any,
      };

      const mockSaved = { id: 1, ...dto };
      mockRepository.create.mockReturnValue(mockSaved);
      mockRepository.save.mockResolvedValue(mockSaved);

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 9999, // 99.99 * 100
        })
      );
    });
  });

  describe('update', () => {
    it('should update movimentation successfully', async () => {
      const existing = {
        id: 1,
        date: new Date('2025-11-20'),
        value: 10000,
        classification: { id: 1 } as any,
      };

      const dto = {
        value: 200,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.merge.mockReturnValue({ ...existing, ...dto, value: 20000 });
      mockRepository.save.mockResolvedValue({ ...existing, ...dto, value: 20000 });

      const result = await service.update(1, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
      expect(result.value).toBe(20000);
    });

    it('should throw NotFoundException if movimentation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { value: 100 })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const existing = { id: 1 } as any;
      mockRepository.findOne.mockResolvedValue(existing);

      await expect(service.update(1, { date: 'invalid-date' })).rejects.toThrow(BadRequestException);
    });

    it('should update only provided fields', async () => {
      const existing = {
        id: 1,
        date: new Date('2025-11-20'),
        value: 10000,
        paymentMethod: PaymentMethod.PIX,
      };

      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.merge.mockReturnValue({ ...existing, paymentMethod: PaymentMethod.MONEY });
      mockRepository.save.mockResolvedValue({ ...existing, paymentMethod: PaymentMethod.MONEY });

      const result = await service.update(1, { paymentMethod: PaymentMethod.MONEY });

      expect(result.paymentMethod).toBe(PaymentMethod.MONEY);
      expect(result.value).toBe(10000); // unchanged
    });
  });

  describe('getAllMovimentations', () => {
    it('should return all movimentations with classification relation', async () => {
      const result = await service.getAllMovimentations();

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should apply filters when provided', async () => {
      const filters = {
        dateFrom: '2025-11-01',
        dateTo: '2025-11-30',
        valueMin: '100',
        valueMax: '500',
        classificationId: '5',
      };

      await service.getAllMovimentations(filters as any);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('getMovimentationById', () => {
    it('should return movimentation by id', async () => {
      const mockMovimentation = { id: 1, value: 10000 } as any;
      mockRepository.findOne.mockResolvedValue(mockMovimentation);

      const result = await service.getMovimentationById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMovimentation);
    });
  });
});
