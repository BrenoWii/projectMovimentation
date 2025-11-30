
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Classification } from '../classification/classification.entity';

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    MONEY = 'MONEY',
    TED = 'TED',
}

@Entity()
export class Movimentation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    date: Date;

    @Column({ type: 'int', nullable: false })
    value: number

    @ManyToOne(type => Classification, classification => classification.movimentations)
    classification: Classification;

    @Column({ type: 'date', nullable: true })
    payDate: Date;

    @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
    paymentMethod: string;

    @OneToOne(type => User)
    user: User

}
