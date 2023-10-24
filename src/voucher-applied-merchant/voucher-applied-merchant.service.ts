import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Logger } from "winston";
import { CreateVoucherAppliedMerchantDto } from "./dto/create-voucher-applied-merchant.dto";
import { UpdateVoucherAppliedMerchantDto } from "./dto/update-voucher-applied-location.dto";
import { VoucherAppliedMerchant } from "./entities/voucher-applied-merchant.entity";

@Injectable()
export class VoucherAppliedMerchantService {
  constructor(
    @InjectRepository(VoucherAppliedMerchant)
    private voucherAppliedMerchantRepository: Repository<VoucherAppliedMerchant>,
    @Inject("winston") private readonly logger: Logger
  ) {}
  async create(
    createVoucherAppliedMerchantDto: CreateVoucherAppliedMerchantDto
  ) {
    try {
      const appliedVoucher = new VoucherAppliedMerchant();
      appliedVoucher.code = createVoucherAppliedMerchantDto.code;
      appliedVoucher.merchant_id = createVoucherAppliedMerchantDto.merchant_id;
      await this.voucherAppliedMerchantRepository.save(appliedVoucher);
    } catch (error: any) {
      this.logger.info(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình tạo Voucher cho Location`,
        error: error.message,
      });
    }
  }

  async checkFindMerchantByCode(
    code: string,
    merchant_id: string
  ): Promise<boolean> {
    try {
      const checkMerchantEligibilityForVoucher =
        await this.voucherAppliedMerchantRepository
          .createQueryBuilder("voucher_applied_merchant")
          .where("voucher_applied_merchant.code = :code", { code })
          .andWhere("voucher_applied_merchant.merchant_id = :merchant_id", {
            merchant_id,
          })
          .getOne();
      if (checkMerchantEligibilityForVoucher !== null) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      this.logger.info(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình tìm kiếm Voucher cho Location`,
        error: error.message,
      });
    }
  }

  findAll() {
    return `This action returns all voucherAppliedLocations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} voucherAppliedLocation`;
  }

  update(
    id: number,
    updateVoucherAppliedLocationDto: UpdateVoucherAppliedMerchantDto
  ) {
    return `This action updates a #${id} voucherAppliedLocation`;
  }

  async removeMerchantByCode(code: string): Promise<any> {
    try {
      code = code || '';
      await this.voucherAppliedMerchantRepository.delete({
        code: code
      })
    } catch (error) {
      this.logger.info(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        error: error.message,
        data: {
          promotion_status: `error`,
          promotion_message: `Đã xảy ra lỗi trong quá trình xóa Voucher`,
        },
      });
    }
  }
}
