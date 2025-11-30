import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { BulkCreateDto, AnalyzeExtractDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-guard';

@Controller('api/import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeExtract(
    @UploadedFile() file: Express.Multer.File,
    @Body('csvContent') csvContent: string,
    @Request() req,
  ) {
    let content: string;

    // Accept either file upload or JSON body
    if (file) {
      content = file.buffer.toString('utf-8');
      console.log('Received file upload, size:', file.size);
    } else if (csvContent) {
      content = csvContent;
      console.log('Received CSV in body, length:', csvContent.length);
    } else {
      throw new BadRequestException('Please provide either a CSV file or csvContent in the body');
    }

    return this.importService.analyzeExtract(content, req.user.id);
  }

  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateDto, @Request() req) {
    return this.importService.bulkCreate(dto.movimentations, req.user.id);
  }
}
