import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountType } from "src/enum/discount-type.enum";
import { FreeShippingType } from "src/enum/freship-type.enum";
import { Repository } from "typeorm";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { UpdateVoucherDto } from "./dto/update-voucher.dto";
import { Voucher } from "./entities/voucher.entity";
import { OutputCheckVoucher } from "./models/output.checkVoucher";
import moment from "moment";
import { AppliedVoucherService } from "src/applied_voucher/applied_voucher.service";
import { InputCheckAvailableVoucher } from "./models/input.checkAvailableVoucher";
import { MerchantsQueueService } from "../merchants-queue/merchants-queue.service";
import { isDateRangeValid } from "../utils/DateRangeValid"

import { VoucherAppliedMerchantService } from "../voucher-applied-merchant/voucher-applied-merchant.service";
import { UtilsVoucherService } from "./utils-voucher.service";
@Injectable()
export class BikeVoucherService {
  private readonly logger = new Logger(BikeVoucherService.name);
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private appliedVoucherService: AppliedVoucherService,
    private readonly merchantQueue: MerchantsQueueService,
    private readonly voucherAppliedMerchantRepository: VoucherAppliedMerchantService,
    private readonly utilsService: UtilsVoucherService

  ) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<any> {
    try {
      const checkDate = await isDateRangeValid(
        createVoucherDto.start_date,
        createVoucherDto.end_date
      );
      if (!checkDate) {
        return {
            message: `Error: Giá trị Ngày bắt đầu không được quá ngày kết thúc`,
          };
      }
        const existingCode = await this.utilsService.findByCode(createVoucherDto.code);
        if (existingCode){
          return Object.assign({
            message: `Error: Mã code đã tồn tại`,
        });
        }
        //hiện tại discout_type đang gán 2 giá trị ở bikes-voucher
        if(!(parseInt(createVoucherDto.discount_type) > 0 && parseInt(createVoucherDto.discount_type) <= 2)){
            return {
                message: 'discount type is invalid',
            }
        }
        const end_date_string =await this.utilsService.formatISODateToDateTimeString(createVoucherDto.end_date) ;
          let voucherModel;
        switch(createVoucherDto.discount_type){
          case "1":
             voucherModel = {
              ...createVoucherDto,
              description: `Giảm ${createVoucherDto.discount_percent}% giá trị chuyến đi. Có giá trị đến ${end_date_string} `,
              discount_percent: createVoucherDto.discount_percent,
              discount_value: null, // Bỏ trường discount_value
              minimum_order_value: null, // Bỏ trường minimum_order_value
            };
            break;
           case "2":
             voucherModel = {
              ...createVoucherDto,
              description: `Giảm ${createVoucherDto.discount_value} đồng cho chuyến đi có giá trị tối thiểu ${createVoucherDto.minimum_order_value} đồng. Có giá trị đến ${end_date_string}`,
              discount_value: createVoucherDto.discount_value,
              minimum_order_value: createVoucherDto.minimum_order_value,
              discount_percent: null, // Bỏ trường discount_percent
            };
            break;
           
        }       
        const voucher = this.voucherRepository.create(voucherModel);
        const result = await this.voucherRepository.save(voucher);
        // if (createVoucherDto.merchant_ids != null && createVoucherDto.is_for_specified_merchants == true) {
        //   const arr = await this.utilsService.checkExistenceMerchant(
        //     createVoucherDto.merchant_ids
        //   );
        //   await Promise.all(
        //     arr.map(async (merchantId) => {
        //       const voucherAppliedMerchantModel = {
        //         code: createVoucherDto.code,
        //         merchant_id: merchantId,
        //       };
        //       await this.voucherAppliedMerchantRepository.create(
        //         voucherAppliedMerchantModel
        //       );
        //     })
        //   );
        // }
        return result
   
    } catch (error: any) {
      this.logger.log(`Error: ${error}`);
      this.logger.log(`Error: ${error.message}`);
    }
  }
}