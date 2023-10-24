import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { DiscountType } from 'src/enum/discount-type.enum';
import { FreeShippingType } from 'src/enum/freship-type.enum';
import { CreateVoucherDto } from './create-voucher.dto';

export class UpdateVoucherDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  usage_limit: number;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @IsNotEmpty()
  @IsEnum(FreeShippingType)
  free_shipping_condition: FreeShippingType;

  @IsOptional()
  @IsNumber()
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @IsOptional()
  @IsNumber()
  minimum_order_value?: number;

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  end_date: Date;

}
