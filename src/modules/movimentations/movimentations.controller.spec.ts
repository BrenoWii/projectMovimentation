import { Test, TestingModule } from '@nestjs/testing';
import { MovimentationsController } from './movimentations.controller';
import { MovimentationsService } from './movimentations.service';

describe('MovimentationsController', () => {
  let controller: MovimentationsController;
  let service: MovimentationsService;

  const mockMovimentationsService = {
    getAllMovimentations: jest.fn(),
    getMovimentationById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimentationsController],
      providers: [
        {
          provide: MovimentationsService,
          useValue: mockMovimentationsService,
        },
      ],
    }).compile();

    controller = module.get<MovimentationsController>(MovimentationsController);
    service = module.get<MovimentationsService>(MovimentationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
