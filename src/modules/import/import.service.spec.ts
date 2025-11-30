import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movimentation } from '../movimentations/movimentation.entity';
import { Repository } from 'typeorm';
import { DescriptionMappingService } from '../description-mapping/description-mapping.service';

describe('ImportService', () => {
  let service: ImportService;
  let movimentationRepository: Repository<Movimentation>;
  let descriptionMappingService: DescriptionMappingService;

  const mockMovimentationRepository = {
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockDescriptionMappingService = {
    findByDescription: jest.fn(),
    findSimilar: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: getRepositoryToken(Movimentation),
          useValue: mockMovimentationRepository,
        },
        {
          provide: DescriptionMappingService,
          useValue: mockDescriptionMappingService,
        },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);
    movimentationRepository = module.get<Repository<Movimentation>>(
      getRepositoryToken(Movimentation)
    );
    descriptionMappingService = module.get<DescriptionMappingService>(DescriptionMappingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeExtract', () => {
    it('should parse CSV content and return analyzed items', async () => {
      const csvContent = `date,description,value
2025-11-30,PAGAMENTO PIX - LOJA ABC,100.50
2025-11-29,TED EMPRESA XYZ,-250.00`;

      mockDescriptionMappingService.findByDescription.mockResolvedValue(null);
      mockDescriptionMappingService.findSimilar.mockResolvedValue([]);

      const result = await service.analyzeExtract(csvContent, 1);

      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('stats');
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toHaveProperty('date');
      expect(result.rows[0]).toHaveProperty('description');
      expect(result.rows[0]).toHaveProperty('value');
      expect(result.rows[0].date).toBe('2025-11-30');
      expect(result.rows[0].value).toBe(100.50);
    });

    it('should parse Nubank format CSV', async () => {
      const csvContent = `Data,Valor,Identificador,Descrição
30/11/2025,"2.022,34",xyz,PAGAMENTO PIX - LOJA ABC`;

      mockDescriptionMappingService.findByDescription.mockResolvedValue(null);
      mockDescriptionMappingService.findSimilar.mockResolvedValue([]);

      const result = await service.analyzeExtract(csvContent, 1);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].date).toBe('2025-11-30');
      expect(result.rows[0].value).toBe(2022.34);
      expect(result.rows[0].description).toBe('PAGAMENTO PIX - LOJA ABC');
    });

    it('should apply exact matching mappings with high confidence', async () => {
      const csvContent = `date,description,value
2025-11-30,PAGAMENTO PIX - LOJA ABC,100`;

      mockDescriptionMappingService.findByDescription.mockResolvedValue({
        id: 1,
        pattern: 'PAGAMENTO PIX - LOJA ABC',
        classificationId: 5,
        classification: { description: 'Compras' },
      });
      mockDescriptionMappingService.findSimilar.mockResolvedValue([]);

      const result = await service.analyzeExtract(csvContent, 1);

      expect(result.rows[0].suggestedClassificationId).toBe(5);
      expect(result.rows[0].suggestedClassificationName).toBe('Compras');
      expect(result.rows[0].confidence).toBe('high');
    });

    it('should apply similar mappings with medium/low confidence', async () => {
      const csvContent = `date,description,value
2025-11-30,PAGAMENTO PIX - LOJA ABC,100`;

      mockDescriptionMappingService.findByDescription.mockResolvedValue(null);
      mockDescriptionMappingService.findSimilar.mockResolvedValue([
        {
          id: 1,
          classificationId: 5,
          classification: { description: 'Compras' },
        },
      ]);

      const result = await service.analyzeExtract(csvContent, 1);

      expect(result.rows[0].suggestedClassificationId).toBe(5);
      expect(result.rows[0].confidence).toBe('medium');
    });

    it('should skip rows with zero or invalid value', async () => {
      const csvContent = `date,description,value
2025-11-30,Test,0
2025-11-29,Test2,invalid`;

      mockDescriptionMappingService.findByDescription.mockResolvedValue(null);
      mockDescriptionMappingService.findSimilar.mockResolvedValue([]);

      const result = await service.analyzeExtract(csvContent, 1);

      expect(result.rows).toHaveLength(0);
    });

    it('should return stats with suggestion counts', async () => {
      const csvContent = `date,description,value
2025-11-30,MAPPED ITEM,100
2025-11-29,UNMAPPED ITEM,50`;

      mockDescriptionMappingService.findByDescription
        .mockResolvedValueOnce({
          classificationId: 5,
          classification: { description: 'Compras' },
        })
        .mockResolvedValueOnce(null);
      mockDescriptionMappingService.findSimilar.mockResolvedValue([]);

      const result = await service.analyzeExtract(csvContent, 1);

      expect(result.stats.total).toBe(2);
      expect(result.stats.withSuggestion).toBe(1);
      expect(result.stats.withoutSuggestion).toBe(1);
    });

    it('should handle empty CSV', async () => {
      const result = await service.analyzeExtract('', 1);

      expect(result.rows).toHaveLength(0);
      expect(result.stats.total).toBe(0);
    });
  });

  describe('bulkCreate', () => {
    const mockUser = { id: 1 };

    it('should create multiple movimentations successfully', async () => {
      const items = [
        {
          date: '2025-11-30',
          value: 10000, // already in cents
          description: 'Compra teste',
          classificationId: 5,
          learnMapping: false,
        } as any,
        {
          date: '2025-11-29',
          value: 5000,
          description: 'Outra compra',
          classificationId: 3,
          learnMapping: false,
        } as any,
      ];

      mockMovimentationRepository.create.mockImplementation((dto) => dto);
      mockMovimentationRepository.save.mockResolvedValue({ id: 1 });

      const result = await service.bulkCreate(items, mockUser.id);

      expect(result.created).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockMovimentationRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should learn mappings when learnMapping is true and originalDescription provided', async () => {
      const items = [
        {
          date: '2025-11-30',
          value: 10000,
          description: 'Test',
          originalDescription: 'PAGAMENTO PIX - NOVA LOJA',
          classificationId: 5,
          learnMapping: true,
        } as any,
      ];

      mockMovimentationRepository.create.mockImplementation((dto) => dto);
      mockMovimentationRepository.save.mockResolvedValue({ id: 1 });
      mockDescriptionMappingService.create.mockResolvedValue({});

      await service.bulkCreate(items, mockUser.id);

      expect(mockDescriptionMappingService.create).toHaveBeenCalledWith(
        {
          extractDescription: 'PAGAMENTO PIX - NOVA LOJA',
          classificationId: 5,
        },
        mockUser.id
      );
    });

    it('should not learn mapping when learnMapping is false', async () => {
      const items = [
        {
          date: '2025-11-30',
          value: 10000,
          description: 'Test',
          originalDescription: 'Test Description',
          classificationId: 5,
          learnMapping: false,
        } as any,
      ];

      mockMovimentationRepository.create.mockImplementation((dto) => dto);
      mockMovimentationRepository.save.mockResolvedValue({ id: 1 });

      await service.bulkCreate(items, mockUser.id);

      expect(mockDescriptionMappingService.create).not.toHaveBeenCalled();
    });

    it('should not learn mapping when originalDescription is missing', async () => {
      const items = [
        {
          date: '2025-11-30',
          value: 10000,
          description: 'Test',
          classificationId: 5,
          learnMapping: true,
        } as any,
      ];

      mockMovimentationRepository.create.mockImplementation((dto) => dto);
      mockMovimentationRepository.save.mockResolvedValue({ id: 1 });

      await service.bulkCreate(items, mockUser.id);

      expect(mockDescriptionMappingService.create).not.toHaveBeenCalled();
    });

    it('should handle errors and return error list', async () => {
      const items = [
        {
          date: '2025-11-30',
          value: 10000,
          description: 'Test',
          classificationId: 999,
          learnMapping: false,
        } as any,
      ];

      mockMovimentationRepository.create.mockImplementation(() => {
        throw new Error('Classification not found');
      });

      const result = await service.bulkCreate(items, mockUser.id);

      expect(result.created).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toHaveProperty('error');
      expect(result.errors[0].error).toBe('Classification not found');
    });

    it('should handle empty items array', async () => {
      const result = await service.bulkCreate([], 1);

      expect(result.created).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should normalize ISO date format with time', async () => {
      const items = [
        {
          date: '2025-11-30T00:00:00Z',
          value: 10000,
          description: 'Test',
          classificationId: 5,
          learnMapping: false,
        } as any,
      ];

      let capturedDate: Date;
      mockMovimentationRepository.create.mockImplementation((dto) => {
        capturedDate = dto.date;
        return dto;
      });
      mockMovimentationRepository.save.mockResolvedValue({ id: 1 });

      await service.bulkCreate(items, 1);

      expect(capturedDate).toBeInstanceOf(Date);
      expect(capturedDate.getFullYear()).toBe(2025);
      expect(capturedDate.getMonth()).toBe(10); // November = 10
      expect(capturedDate.getDate()).toBe(30);
    });

    it('should handle payDate when provided', async () => {
      const items = [
        {
          date: '2025-11-30',
          payDate: '2025-12-05',
          value: 10000,
          description: 'Test',
          classificationId: 5,
          paymentMethod: 'CREDIT_CARD',
          learnMapping: false,
        } as any,
      ];

      let capturedPayDate: Date;
      mockMovimentationRepository.create.mockImplementation((dto) => {
        capturedPayDate = dto.payDate;
        return dto;
      });
      mockMovimentationRepository.save.mockResolvedValue({ id: 1 });

      await service.bulkCreate(items, 1);

      expect(capturedPayDate).toBeInstanceOf(Date);
      expect(capturedPayDate.getDate()).toBe(5);
    });
  });
});

