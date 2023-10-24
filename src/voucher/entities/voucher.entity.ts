import { IsNumber, IsString } from 'class-validator';
import { DiscountType } from '../../enum/discount-type.enum';
import { FreeShippingType } from '../../enum/freship-type.enum';
import { ServiceType } from '../../enum/service-type.enum';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppearType } from 'src/enum/appear_type.enum';

@Entity({ name: 'voucher' })
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  code: string;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsNumber()
  usage_limit: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discount_type: DiscountType;

  @Column({
    type: 'enum',
    enum: FreeShippingType,
  })
  free_shipping_condition: FreeShippingType;

  @Column()
  @IsNumber()
  minimum_order_value: number;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  discount_percent?: number;

  @Column()
  discount_value?: number;

  @Column()
  @IsNumber()
  area_id: number;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updated_at: Date;

  @Column({ default: false })
  is_for_specified_merchants: boolean;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  service_type: ServiceType;

  @Column({
    type: 'enum',
    enum: AppearType,
  })
  appear_type: AppearType;
}
