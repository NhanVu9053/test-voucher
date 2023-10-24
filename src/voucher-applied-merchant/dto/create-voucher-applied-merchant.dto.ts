import { IsNotEmpty } from "class-validator";

export class CreateVoucherAppliedMerchantDto {
    @IsNotEmpty()
    code: string;
  
    @IsNotEmpty()
    merchant_id: string;
}
