import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { AppliedVoucher } from 'src/applied_voucher/entities/applied_voucher.entity';
import { AppliedVoucherService } from 'src/applied_voucher/applied_voucher.service';
import { MerchantsQueueModule } from '../merchants-queue/merchants-queue.module';
import { VoucherAppliedMerchantService } from '../voucher-applied-merchant/voucher-applied-merchant.service';
import { VoucherAppliedMerchant } from '../voucher-applied-merchant/entities/voucher-applied-merchant.entity';
import { BikeVoucherService } from './bike-voucher.service';
import { DeliveryVoucherService } from './delivery-voucher.service';
import { UtilsVoucherService } from './utils-voucher.service';

@Module({
  imports:[TypeOrmModule.forFeature([Voucher]),
  TypeOrmModule.forFeature([AppliedVoucher]),TypeOrmModule.forFeature([VoucherAppliedMerchant]),
  MerchantsQueueModule],
  controllers: [VoucherController],
  providers: [
    VoucherService,
    AppliedVoucherService,
    VoucherAppliedMerchantService,
    BikeVoucherService,
    DeliveryVoucherService,
    UtilsVoucherService
  ]
})
export class VoucherModule {}
