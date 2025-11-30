import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Movimentation } from '../movimentations/movimentation.entity';
import { DescriptionMappingModule } from '../description-mapping/description-mapping.module';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movimentation]),
    DescriptionMappingModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
