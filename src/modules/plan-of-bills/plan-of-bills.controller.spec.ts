import { Test, TestingModule } from '@nestjs/testing';
import { PlanOfBillsController } from './plan-of-bills.controller';
import { PlanOfBillsService } from './plan-of-bills.service';

describe('PlanOfBillsController', () => {
  let controller: PlanOfBillsController;
  let service: PlanOfBillsService;

  const mockPlanOfBillsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanOfBillsController],
      providers: [
        {
          provide: PlanOfBillsService,
          useValue: mockPlanOfBillsService,
        },
      ],
    }).compile();

    controller = module.get<PlanOfBillsController>(PlanOfBillsController);
    service = module.get<PlanOfBillsService>(PlanOfBillsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
