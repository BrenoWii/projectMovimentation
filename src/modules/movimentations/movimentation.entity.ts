
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

    @ManyToOne(type => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn({ name: 'create_date', type: 'timestamp' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date', type: 'timestamp' })
    updateDate: Date;

}
