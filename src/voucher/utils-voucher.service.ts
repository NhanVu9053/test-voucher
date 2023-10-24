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
import { VoucherAppliedMerchantService } from "../voucher-applied-merchant/voucher-applied-merchant.service";
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
}