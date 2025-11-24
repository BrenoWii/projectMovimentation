
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Classification } from '../classification/classification.entity';

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

    @OneToOne(type => User)
    user: User

}
