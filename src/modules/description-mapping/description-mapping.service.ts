import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DescriptionMapping } from './description-mapping.entity';
import { CreateMappingDto, UpdateMappingDto } from './dto';

@Injectable()
export class DescriptionMappingService {
  constructor(
    @InjectRepository(DescriptionMapping)
    private readonly mappingRepository: Repository<DescriptionMapping>,
  ) {}

  private normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s]/g, '');
  }

  async findAll(userId: number): Promise<DescriptionMapping[]> {
    return this.mappingRepository.find({
      where: { userId },
      relations: ['classification'],
      order: { createDate: 'DESC' },
    });
  }

  async findByDescription(
    description: string,
    userId: number,
  ): Promise<DescriptionMapping | null> {
    const normalized = this.normalizeDescription(description);
    
    return this.mappingRepository.findOne({
      where: { normalizedDescription: normalized, userId },
      relations: ['classification'],
    });
  }

  async findSimilar(
    description: string,
    userId: number,
  ): Promise<DescriptionMapping[]> {
    const normalized = this.normalizeDescription(description);
    
    // Stop words to ignore in matching
    const stopWords = new Set([
      'transferncia', 'enviada', 'recebida', 'pelo', 'pix', 
      'compra', 'dbito', 'crdito', 'agncia', 'conta', 'banco',
      'sa', 'ltda', 'instituio', 'pagamento'
    ]);
    
    const words = normalized
      .split(' ')
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    if (words.length === 0) {
      return [];
    }

    const allMappings = await this.mappingRepository.find({
      where: { userId },
      relations: ['classification'],
    });

    return allMappings
      .map(mapping => {
        const mappingWords = mapping.normalizedDescription
          .split(' ')
          .filter(w => w.length > 2 && !stopWords.has(w));
        
        // Count exact word matches
        const exactMatches = words.filter(w => 
          mappingWords.includes(w)
        ).length;
        
        // Count partial matches (substring)
        const partialMatches = words.filter(w => 
          mappingWords.some(mw => mw.includes(w) || w.includes(mw))
        ).length;
        
        // Prioritize exact matches
        const score = (exactMatches * 2 + partialMatches) / (words.length * 2);
        
        return {
          mapping,
          score,
        };
      })
      .filter(item => item.score > 0.6) // Increased threshold from 0.5 to 0.6
      .sort((a, b) => b.score - a.score)
      .map(item => item.mapping);
  }

  async create(
    dto: CreateMappingDto,
    userId: number,
  ): Promise<DescriptionMapping> {
    const normalized = this.normalizeDescription(dto.extractDescription);
    
    const existing = await this.mappingRepository.findOne({
      where: { normalizedDescription: normalized, userId },
    });

    if (existing) {
      existing.classificationId = dto.classificationId;
      return this.mappingRepository.save(existing);
    }

    const mapping = this.mappingRepository.create({
      extractDescription: dto.extractDescription,
      normalizedDescription: normalized,
      classificationId: dto.classificationId,
      userId,
    });

    return this.mappingRepository.save(mapping);
  }

  async update(
    id: number,
    dto: UpdateMappingDto,
    userId: number,
  ): Promise<DescriptionMapping> {
    const mapping = await this.mappingRepository.findOne({
      where: { id, userId },
    });

    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }

    if (dto.extractDescription) {
      mapping.extractDescription = dto.extractDescription;
      mapping.normalizedDescription = this.normalizeDescription(
        dto.extractDescription,
      );
    }

    if (dto.classificationId) {
      mapping.classificationId = dto.classificationId;
    }

    return this.mappingRepository.save(mapping);
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await this.mappingRepository.delete({ id, userId });
    
    if (result.affected === 0) {
      throw new NotFoundException('Mapping not found');
    }
  }
}
