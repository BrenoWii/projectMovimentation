import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescriptionMapping } from './description-mapping.entity';
import { DescriptionMappingService } from './description-mapping.service';
import { DescriptionMappingController } from './description-mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DescriptionMapping])],
  controllers: [DescriptionMappingController],
  providers: [DescriptionMappingService],
  exports: [DescriptionMappingService],
})
export class DescriptionMappingModule {}
