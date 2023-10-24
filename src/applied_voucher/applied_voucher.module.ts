import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppliedVoucherService } from './applied_voucher.service';
import { AppliedVoucher } from './entities/applied_voucher.entity';

@Module({
  imports:[TypeOrmModule.forFeature([AppliedVoucher])],
  providers: [AppliedVoucherService],
  exports: [AppliedVoucherService]
})
export class AppliedVoucherModule {}
