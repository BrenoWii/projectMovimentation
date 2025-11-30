import { Test, TestingModule } from '@nestjs/testing';
import { PlanOfBillsService } from './plan-of-bills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlanOfBills } from './plan-of-bills.entity';
import { Repository } from 'typeorm';

describe('PlanOfBillsService', () => {
  let service: PlanOfBillsService;
  let repository: Repository<PlanOfBills>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanOfBillsService,
        {
          provide: getRepositoryToken(PlanOfBills),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PlanOfBillsService>(PlanOfBillsService);
    repository = module.get<Repository<PlanOfBills>>(getRepositoryToken(PlanOfBills));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
