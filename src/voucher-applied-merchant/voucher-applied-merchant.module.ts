import { Module } from '@nestjs/common';
import { VoucherAppliedMerchantService } from './voucher-applied-merchant.service';
import { VoucherAppliedMerchantController } from './voucher-applied-merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherAppliedMerchant } from './entities/voucher-applied-merchant.entity';

@Module({
  imports:[TypeOrmModule.forFeature([VoucherAppliedMerchant])],
  controllers: [VoucherAppliedMerchantController],
  providers: [VoucherAppliedMerchantService],
  exports: [VoucherAppliedMerchantService]
})
export class VoucherAppliedMerchantModule {}
