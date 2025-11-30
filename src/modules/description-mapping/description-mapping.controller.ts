import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DescriptionMappingService } from './description-mapping.service';
import { CreateMappingDto, UpdateMappingDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-guard';

@Controller('api/mappings')
@UseGuards(JwtAuthGuard)
export class DescriptionMappingController {
  constructor(private readonly mappingService: DescriptionMappingService) {}

  @Get()
  async findAll(@Request() req) {
    return this.mappingService.findAll(req.user.id);
  }

  @Post()
  async create(@Body() dto: CreateMappingDto, @Request() req) {
    return this.mappingService.create(dto, req.user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateMappingDto,
    @Request() req,
  ) {
    return this.mappingService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req) {
    await this.mappingService.delete(id, req.user.id);
    return { message: 'Mapping deleted successfully' };
  }
}
