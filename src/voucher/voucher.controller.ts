import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { UpdateVoucherDto } from "./dto/update-voucher.dto";
import { InputCheckAvailableVoucher } from "./models/input.checkAvailableVoucher";

@Controller("voucher")
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    try {
      const result = await this.voucherService.create(createVoucherDto);
    if(result.message ){
      return {message:result.message};
    }
    return {
        data: result,
        statusCode: 201,
        status: `success`,
    }
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }

  @Get()
  findAll() {
    return this.voucherService.findAll();
  }

  @Get("/check")
  check(
    @Query("order_price") order_price: number,
    @Query("shipping_fee") shipping_fee: number,
    @Query("promotion_code") promotion_code: string,
    @Query("customer_id") customer_id: string,
    @Query("merchant_id") merchant_id: string,
    @Query("service_type") service_type: string    
  ) {
    return this.voucherService.checkVoucher(
      order_price,
      shipping_fee,
      promotion_code,
      customer_id,
      merchant_id,
      service_type
    );
  }
  @Get("/available")
  available(
    @Query("order_price") order_price: number,
    @Query("shipping_fee") shipping_fee: number,
    @Query("customer_id") customer_id: string,
    @Query("merchant_id") merchant_id: string,
    @Query("service_type") service_type: string    
  ) {
    const input: InputCheckAvailableVoucher = {
      order_price: order_price,
      shipping_fee: shipping_fee,
      customer_id: customer_id,
      merchants_id: merchant_id,
      service_type: service_type
    }
    return this.voucherService.isAvailableVouchers(
     input
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.voucherService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.voucherService.update(+id, updateVoucherDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.voucherService.remove(+id);
  }
}
