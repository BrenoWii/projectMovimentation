import { Module } from '@nestjs/common';
import { Movimentation } from './movimentation.entity';
import { MovimentationsController } from './movimentations.controller';
import { MovimentationsService } from './movimentations.service';
import { TypeOrmModule } from '@nestjs/typeorm'
@Module({
  imports: [
    TypeOrmModule.forFeature([Movimentation])
  ],
  controllers: [MovimentationsController],
  providers: [MovimentationsService]
})
export class MovimentationsModule {}
