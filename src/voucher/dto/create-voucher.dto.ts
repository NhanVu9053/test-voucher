import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { AppearType } from "../../enum/appear_type.enum";
import { DiscountType } from "../../enum/discount-type.enum";
import { FreeShippingType } from "../../enum/freship-type.enum";
import { ServiceType } from "../../enum/service-type.enum";

export class CreateVoucherDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  usage_limit: number; // Lượt sử dụng

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @IsOptional()
  @IsEnum(FreeShippingType)
  free_shipping_condition?: FreeShippingType;

  @IsOptional()
  @IsNumber()
  discount_percent?: number; // giảm theo %

  @IsOptional()
  @IsNumber()
  discount_value?: number; // giá trị giảm 

  @IsOptional()
  @IsNumber()
  minimum_order_value?: number; // giảm theo đơn hàng ít nhất

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  end_date: Date;

  @IsOptional()
  merchant_ids?: string[];

  @IsOptional()
  is_for_specified_merchants?: boolean;

  @IsNotEmpty()
  @IsEnum(ServiceType)
  service_type: ServiceType; 

  @IsNotEmpty()
  @IsEnum(AppearType)
  appear_type: AppearType; //Hiển thị ở đâu
}
