import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimentation } from '../movimentations/movimentation.entity';
import { DescriptionMappingService } from '../description-mapping/description-mapping.service';
import { ExtractRow, AnalyzeResult, BulkMovimentationItemDto } from './dto';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Movimentation)
    private readonly movimentationRepository: Repository<Movimentation>,
    private readonly mappingService: DescriptionMappingService,
  ) {}

  private parseCSV(csvContent: string): any[] {
    if (!csvContent || typeof csvContent !== 'string') {
      console.error('Invalid CSV content:', csvContent);
      return [];
    }

    const lines = csvContent.trim().split('\n');
    console.log(`Parsing CSV with ${lines.length} lines`);
    
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => (h || '').replace(/"/g, '').trim());
    console.log('Headers:', headers);
    
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle CSV with commas inside quoted fields
      const line = lines[i];
      if (!line || line.trim() === '') continue;

      // Simple CSV parser (handles quotes but not nested commas perfectly)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    console.log(`Parsed ${rows.length} rows`);
    return rows;
  }

  private parseNuBankDate(dateStr: string): string {
    // Format: DD/MM/YYYY -> YYYY-MM-DD
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private parseNuBankValue(valueStr: string): number {
    // Remove dots and replace comma with dot: "2.022,34" -> 2022.34
    return parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
  }

  async analyzeExtract(
    csvContent: string,
    userId: number,
  ): Promise<AnalyzeResult> {
    const rows = this.parseCSV(csvContent);
    const extractRows: ExtractRow[] = [];

    for (const row of rows) {
      // Support Nubank format: Data, Valor, Identificador, Descrição
      const dateStr = row.Data || row.date || '';
      const valueStr = row.Valor || row.value || '0';
      const description = row.Descrição || row.description || '';

      // Skip if empty or invalid
      if (!dateStr || !description) {
        continue;
      }

      const date = row.Data ? this.parseNuBankDate(dateStr) : dateStr;
      const value = row.Valor ? this.parseNuBankValue(valueStr) : parseFloat(valueStr);

      // Skip if invalid value
      if (isNaN(value) || value === 0) {
        continue;
      }

      // Try to find exact match first
      let mapping = await this.mappingService.findByDescription(
        description,
        userId,
      );
      
      let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
      
      if (!mapping) {
        // Try similar matches
        const similar = await this.mappingService.findSimilar(description, userId);
        if (similar.length > 0) {
          mapping = similar[0];
          confidence = similar.length === 1 ? 'medium' : 'low';
        }
      } else {
        confidence = 'high';
      }

      extractRows.push({
        date,
        value: value, // Keep original value in reais (with sign)
        description,
        suggestedClassificationId: mapping?.classificationId,
        suggestedClassificationName: mapping?.classification?.description,
        confidence,
      });
    }

    const withSuggestion = extractRows.filter(r => r.suggestedClassificationId).length;

    return {
      rows: extractRows,
      stats: {
        total: extractRows.length,
        withSuggestion,
        withoutSuggestion: extractRows.length - withSuggestion,
      },
    };
  }

  async bulkCreate(
    items: BulkMovimentationItemDto[],
    userId: number,
  ): Promise<{ created: number; errors: any[] }> {
    const errors = [];
    let created = 0;

    for (const item of items) {
      try {
        // Normalize date
        let dateObj: Date;
        if (item.date.includes('T')) {
          const [datePart] = item.date.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          const [year, month, day] = item.date.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        }

        let payDateObj: Date | undefined;
        if (item.payDate) {
          if (item.payDate.includes('T')) {
            const [datePart] = item.payDate.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            payDateObj = new Date(year, month - 1, day);
          } else {
            const [year, month, day] = item.payDate.split('-').map(Number);
            payDateObj = new Date(year, month - 1, day);
          }
        }

        // Value should already be in cents from frontend
        const valueInCents = Math.round(item.value);

        const movimentation = this.movimentationRepository.create({
          date: dateObj,
          value: valueInCents,
          classification: { id: item.classificationId } as any,
          user: { id: userId } as any,
          payDate: payDateObj,
          paymentMethod: item.paymentMethod,
        });

        await this.movimentationRepository.save(movimentation);

        // Learn mapping if requested
        if (item.learnMapping && item.originalDescription) {
          console.log('Learning mapping:', {
            description: item.originalDescription,
            classificationId: item.classificationId,
            userId,
          });
          
          await this.mappingService.create(
            {
              extractDescription: item.originalDescription,
              classificationId: item.classificationId,
            },
            userId,
          );
          
          console.log('Mapping learned successfully');
        }

        created++;
      } catch (error) {
        errors.push({
          item,
          error: error.message,
        });
      }
    }

    return { created, errors };
  }
}
