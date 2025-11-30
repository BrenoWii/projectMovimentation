import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Classification } from '../classification/classification.entity';
import { User } from '../users/user.entity';

@Entity('description_mapping')
export class DescriptionMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'extract_description', type: 'varchar', length: 500 })
  extractDescription: string;

  @Column({ name: 'normalized_description', type: 'varchar', length: 500 })
  normalizedDescription: string;

  @ManyToOne(() => Classification)
  @JoinColumn({ name: 'classificationId' })
  classification: Classification;

  @Column({ name: 'classificationId' })
  classificationId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;

  @CreateDateColumn({ name: 'createDate' })
  createDate: Date;

  @UpdateDateColumn({ name: 'updateDate' })
  updateDate: Date;
}
