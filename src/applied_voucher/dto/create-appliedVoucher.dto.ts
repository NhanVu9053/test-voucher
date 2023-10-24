import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { DiscountType } from 'src/enum/discount-type.enum';
import { FreeShippingType } from 'src/enum/freship-type.enum';

export class CreateAppliedVoucherDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  user_id: string;
}
