import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationController } from './classification.controller';
import { Classification } from './classification.entity';
import { ClassificationService } from './classification.service';
import { PlanOfBills } from '../plan-of-bills/plan-of-bills.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classification, PlanOfBills])
  ],
  controllers: [ClassificationController],
  providers: [ClassificationService]
})
export class ClassificationModule {}
