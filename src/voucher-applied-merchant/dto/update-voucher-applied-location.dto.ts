import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherAppliedMerchantDto } from './create-voucher-applied-merchant.dto';

export class UpdateVoucherAppliedMerchantDto extends PartialType(CreateVoucherAppliedMerchantDto) {}
