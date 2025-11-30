import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationController } from './classification.controller';
import { ClassificationService } from './classification.service';

describe('ClassificationController', () => {
  let controller: ClassificationController;
  let service: ClassificationService;

  const mockClassificationService = {
    getClassifications: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassificationController],
      providers: [
        {
          provide: ClassificationService,
          useValue: mockClassificationService,
        },
      ],
    }).compile();

    controller = module.get<ClassificationController>(ClassificationController);
    service = module.get<ClassificationService>(ClassificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
