import { IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'voucher_applied_merchant' })
export class VoucherAppliedMerchant {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @IsString()
    code: string;
  
    @Column()
    @IsNumber()
    merchant_id: string;
  
    @CreateDateColumn({ name: 'created_at' })
    public created_at: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    public updated_at: Date;
}
