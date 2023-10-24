
import {
  Column,
  CreateDateColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';

export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToMany(() => Voucher, (voucher) => voucher.customers)
  // vouchers: Voucher[];

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;
}
