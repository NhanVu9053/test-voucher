import { Controller, Get, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AppService } from './app.service';
import { InputCheckAvailableVoucher } from './voucher/models/input.checkAvailableVoucher';
import { InputCheckVoucher } from './voucher/models/input.checkVoucher';
import { VoucherService } from './voucher/voucher.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly voucherService: VoucherService) {}

  @MessagePattern("laco.voucher.calculate_discount_voucher")
  async getDiscountVoucher(@Payload() input: InputCheckVoucher, @Ctx() context: RmqContext){
    this.logger.log(`Pattern: ${context.getPattern()}`);
    const result = await this.voucherService.checkVoucher(
      input.order_price,
      input.shipping_fee,
      input.promotion_code,
      input.customer_id,
      input.merchant_id);
    return result;
  }

  @MessagePattern("laco.voucher.is_available_voucher")
  async getAvaibleVoucher(@Payload() input: InputCheckAvailableVoucher, @Ctx() context: RmqContext){
    this.logger.log(`Pattern: ${context.getPattern()}`);
    const result = await this.voucherService.isAvailableVouchers(input);
    return result;
  }
}
