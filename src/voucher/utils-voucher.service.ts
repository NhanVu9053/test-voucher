import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountType } from "src/enum/discount-type.enum";
import { FreeShippingType } from "src/enum/freship-type.enum";
import { Repository } from "typeorm";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { UpdateVoucherDto } from "./dto/update-voucher.dto";
import { Voucher } from "./entities/voucher.entity";
import { OutputCheckVoucher } from "./models/output.checkVoucher";
import { AppliedVoucherService } from "src/applied_voucher/applied_voucher.service";
import { InputCheckAvailableVoucher } from "./models/input.checkAvailableVoucher";
import { MerchantsQueueService } from "../merchants-queue/merchants-queue.service";
import { VoucherAppliedMerchantService } from "../voucher-applied-merchant/voucher-applied-merchant.service";
const moment = require('moment');
@Injectable()
export class UtilsVoucherService {
  private readonly logger = new Logger(UtilsVoucherService.name);
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private appliedVoucherService: AppliedVoucherService,
    private readonly merchantQueue: MerchantsQueueService,
    private readonly voucherAppliedMerchantRepository: VoucherAppliedMerchantService
  ) {}

  async findByCode(code: string): Promise<Voucher | undefined> {
    const result = await this.voucherRepository.findOne({ where: { code } });
    return result;
  }

  //Kiểm tra tồn tại của Merchant
  async checkExistenceMerchant(ids: string[]): Promise<any> {
    try {
      const arr: string[] = [];
      for (const id of ids) {
        const checkMerchant = await this.merchantQueue.send(
          "laco.merchants.get_location_detail",
          id
        );
        if (checkMerchant.status === "error") {
          continue;
        } else {
          arr.push(id);
          this.logger.log(`[VoucherService][checkExistenceMerchant]` + arr);
        }
      }
      return arr;
    } catch (error: any) {
      this.logger.log(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình kiểm tra tồn tại Merchant`,
        error: error.message,
      });
    }
  }

  async formatISODateToDateTimeString(date: Date):Promise<string> {
    const a = new Date(date);
    const result = a.toUTCString();
    this.logger.log(result);
    
    return result;
  }

   //Kiểm tra thời gian order có thuộc trong thời gian sử dụng voucher
   async isOrderWithinPromotionTimeRange(
    start_date,
    end_date,
    order_time
  ):Promise<boolean> {
    var check = false;
    const start = moment(start_date);
    const end = moment(end_date);
    const orderDate = moment(order_time, "HH:mm DD/MM/YYYY");
    if (orderDate.isBetween(start, end)) {
      check = true;
      return check;
    } else {
      return check;
    }
  }

  //tính giá sau khi  giảm theo %
  async amountByDiscountPercent(
    order_price: number,
    discount_percents: number
  ): Promise<number> {
    return (order_price * discount_percents) / 100;
  }


  //Tính giá trị đơn hàng giảm theo phí ship
  async totalAmountDiscountShipFee(
    discount_value: number,
    ship_fee: number
  ): Promise<number> {
    const result = ship_fee - discount_value;
    return result;
  }

  //Tính giá trị đơn hàng giảm theo phí ship (phần trăm)
  async totalAmountDiscountShipFeePercent(
    discount_percent: number,
    ship_fee: number
  ): Promise<number> {
    const result = ship_fee * discount_percent / 100;
    return result;
  }


  // Tính toán kết quả output giảm giá theo %
   async calculateDiscountPercent(
    promotion_code: string,
    order_price: number,
    discount_percent: number,
    
  ): Promise<any> {
    //tính giá sau khi  giảm theo %
    const discountByPercentResult = await this.amountByDiscountPercent(
      order_price,
      discount_percent
    ); 
    const outputDiscountByPercentResult: OutputCheckVoucher = {
      promotion_code: promotion_code,
      promotion_status: "success",
      promotion_message: "Áp dụng thành công",
      discount_amount: discountByPercentResult,
    };
    return outputDiscountByPercentResult;
  }

  //Tính toán kết quả output giảm giá theo giá trị nhỏ nhất
   async calculateDiscountMiniumOrder(
    promotion_code: string,
    discount_value: number
  ): Promise<any> {
    //Tính tiền theo phương pháp giảm theo mini order

    const outputDiscountByPercentResult: OutputCheckVoucher = {
      promotion_code: promotion_code,
      promotion_status: "success",
      promotion_message: "Áp dụng thành công",
      discount_amount: discount_value,
    };
    return outputDiscountByPercentResult;
  }

  //Tính toán tiền giảm phí ship
   async calculateDiscountForShip(
    promotion_code: string,
    discount_value: number,
    freeShipFeenumbers: number
  ): Promise<any> {
    const finalAmountNumber = await this.totalAmountDiscountShipFee(
      discount_value,
      freeShipFeenumbers
    );
    const outputDiscountByPercentResult: OutputCheckVoucher = {
      promotion_code: promotion_code,
      promotion_status: "success",
      promotion_message: "Áp dụng thành công",
      discount_amount: finalAmountNumber,
    };
    return outputDiscountByPercentResult;
  }
  //Tính toán tiền giảm phí ship (theo phần trăm)
   async calculateDiscountForShipByPercent(
    promotion_code: string,
    discount_percent: number,
    freeShipFeenumbers: number
  ): Promise<any> {
    const finalAmountNumber = await this.totalAmountDiscountShipFeePercent(
      discount_percent,
      freeShipFeenumbers
    );
    const outputDiscountByPercentResult: OutputCheckVoucher = {
      promotion_code: promotion_code,
      promotion_status: "success",
      promotion_message: "Áp dụng thành công",
      discount_amount: finalAmountNumber,
    };
    return outputDiscountByPercentResult;
  }

   //Kiểm tra mã voucher có tồn tại
   async getVoucherByCode(promotion_code: string): Promise<any> {
    var check = false;

    const data = await this.voucherRepository
      .createQueryBuilder("voucher")
      .where("voucher.code = :code", { code: promotion_code })
      .getOne();
    if (data != null) {
      check = true;
      return { check, data };
    } else {
      const message = "Mã Voucher không đúng";
      return { check, message };
    }
  }

    //Kiểm trả voucher còn lượt sử dụng
    async isCheckVoucherUsage(
      checksVoucher: number,
      usedVoucher: number
    ): Promise<boolean> {
      var check = false;
      if (usedVoucher < checksVoucher) {
        check = true;
        return check;
      }
      return check;
    }
  
}