import { IsNumber, IsString } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity({ name: 'applied_voucher' })
export class AppliedVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  code: string;

  @Column()
  @IsNumber()
  user_id: string;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;
}
