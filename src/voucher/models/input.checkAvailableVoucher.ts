import { IsOptional } from "class-validator"

export class InputCheckAvailableVoucher {
    @IsOptional()
    order_price: number
    @IsOptional()
    shipping_fee: number
    @IsOptional()
    customer_id: string
    @IsOptional()
    merchants_id: string
    @IsOptional()
    service_type: string
  }