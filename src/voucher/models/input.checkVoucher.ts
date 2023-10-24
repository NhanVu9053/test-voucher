import { IsOptional } from "class-validator"

export class InputCheckVoucher {
    @IsOptional()
    order_price: number
    @IsOptional()
    shipping_fee: number
    @IsOptional()
    promotion_code: string
    @IsOptional()
    customer_id: string
    @IsOptional()
    merchant_id:string
  }