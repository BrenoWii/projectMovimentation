import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { PlanOfBills } from '../plan-of-bills/plan-of-bills.entity'
import { Movimentation } from '../movimentations/movimentation.entity';

@Entity({
  name: 'classification',
})
export class Classification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  type: string;

  @ManyToOne(type => PlanOfBills, planOfBill => planOfBill.classifications)
  planOfBill: PlanOfBills;

  @OneToMany(type => Movimentation, movimentation => movimentation.classification)
  movimentations: Movimentation[];

  @CreateDateColumn()
  createDate: Date
  
  @UpdateDateColumn()
  updateDate: Date

}
