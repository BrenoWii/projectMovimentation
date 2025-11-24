import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Classification } from '../classification/classification.entity';

@Entity({
  name: 'plan-of-bills',
})
export class PlanOfBills {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @OneToMany(type => Classification, classification => classification.planOfBill)
  classifications: Classification[];

  @CreateDateColumn()
  createDate: Date

  @UpdateDateColumn()
  updateDate: Date

}
