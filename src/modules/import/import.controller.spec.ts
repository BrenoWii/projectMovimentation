import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { BadRequestException } from '@nestjs/common';
import { BulkCreateDto } from './dto';

describe('ImportController', () => {
  let controller: ImportController;
  let service: ImportService;

  const mockImportService = {
    analyzeExtract: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        {
          provide: ImportService,
          useValue: mockImportService,
        },
      ],
    }).compile();

    controller = module.get<ImportController>(ImportController);
    service = module.get<ImportService>(ImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyzeExtract', () => {
    const mockRequest = { user: { id: 1 } };

    it('should analyze extract from file upload', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('date,description,value\n2025-11-30,Test,100'),
        size: 100,
      } as any;

      const expectedResult = { items: [], mappings: [] };
      mockImportService.analyzeExtract.mockResolvedValue(expectedResult);

      const result = await controller.analyzeExtract(mockFile, null, mockRequest);

      expect(mockImportService.analyzeExtract).toHaveBeenCalledWith(
        'date,description,value\n2025-11-30,Test,100',
        1
      );
      expect(result).toEqual(expectedResult);
    });

    it('should analyze extract from CSV content in body', async () => {
      const csvContent = 'date,description,value\n2025-11-30,Test,100';
      const expectedResult = { items: [], mappings: [] };
      mockImportService.analyzeExtract.mockResolvedValue(expectedResult);

      const result = await controller.analyzeExtract(null, csvContent, mockRequest);

      expect(mockImportService.analyzeExtract).toHaveBeenCalledWith(csvContent, 1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if neither file nor csvContent provided', async () => {
      await expect(
        controller.analyzeExtract(null, null, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should prefer file over csvContent if both provided', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('file content'),
        size: 12,
      } as any;
      const csvContent = 'body content';

      mockImportService.analyzeExtract.mockResolvedValue({ items: [], mappings: [] });

      await controller.analyzeExtract(mockFile, csvContent, mockRequest);

      expect(mockImportService.analyzeExtract).toHaveBeenCalledWith('file content', 1);
    });
  });

  describe('bulkCreate', () => {
    const mockRequest = { user: { id: 1 } };

    it('should create movimentations in bulk with standard format', async () => {
      const dto: BulkCreateDto = {
        items: [
          {
            date: '2025-11-30',
            value: 100,
            description: 'Compra teste',
            classificationId: 5,
            payDate: '2025-12-01',
            paymentMethod: 'PIX' as any,
          },
          {
            date: '2025-11-29',
            value: 50,
            description: 'Outra compra',
            classificationId: 3,
          },
        ],
        learnFromImport: true,
      };

      const expectedResult = {
        created: 2,
        failed: 0,
        items: [],
      };

      mockImportService.bulkCreate.mockResolvedValue(expectedResult);

      const result = await controller.bulkCreate(dto, mockRequest);

      expect(mockImportService.bulkCreate).toHaveBeenCalledWith(
        [
          {
            date: '2025-11-30',
            value: 100,
            originalDescription: 'Compra teste',
            classificationId: 5,
            payDate: '2025-12-01',
            paymentMethod: 'PIX',
            learnMapping: true,
          },
          {
            date: '2025-11-29',
            value: 50,
            originalDescription: 'Outra compra',
            classificationId: 3,
            payDate: undefined,
            paymentMethod: undefined,
            learnMapping: true,
          },
        ],
        1
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle bulk create without learnFromImport flag', async () => {
      const dto: BulkCreateDto = {
        items: [
          {
            date: '2025-11-30',
            value: 100,
            description: 'Test',
            classificationId: 5,
          },
        ],
      };

      mockImportService.bulkCreate.mockResolvedValue({ created: 1, failed: 0, items: [] });

      await controller.bulkCreate(dto, mockRequest);

      const mappedItems = mockImportService.bulkCreate.mock.calls[0][0];
      expect(mappedItems[0].learnMapping).toBeUndefined();
    });

    it('should map description to originalDescription correctly', async () => {
      const dto: BulkCreateDto = {
        items: [
          {
            date: '2025-11-30',
            value: 100,
            description: 'PAGAMENTO PIX - EMPRESA XYZ',
            classificationId: 5,
          },
        ],
        learnFromImport: false,
      };

      mockImportService.bulkCreate.mockResolvedValue({ created: 1, failed: 0, items: [] });

      await controller.bulkCreate(dto, mockRequest);

      const mappedItems = mockImportService.bulkCreate.mock.calls[0][0];
      expect(mappedItems[0].originalDescription).toBe('PAGAMENTO PIX - EMPRESA XYZ');
      expect(mappedItems[0]).not.toHaveProperty('description');
      expect(mappedItems[0].learnMapping).toBe(false);
    });

    it('should handle empty items array', async () => {
      const dto: BulkCreateDto = {
        items: [],
        learnFromImport: true,
      };

      mockImportService.bulkCreate.mockResolvedValue({ created: 0, failed: 0, items: [] });

      const result = await controller.bulkCreate(dto, mockRequest);

      expect(mockImportService.bulkCreate).toHaveBeenCalledWith([], 1);
      expect(result.created).toBe(0);
    });
  });
});
