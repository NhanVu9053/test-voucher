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
import { DeliveryVoucherService } from "./delivery-voucher.service";
import { BikeVoucherService } from "./bike-voucher.service";
import { ServiceType } from "src/enum/service-type.enum";
import { AppearType } from "src/enum/appear_type.enum";

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private appliedVoucherService: AppliedVoucherService,
    private readonly merchantQueue: MerchantsQueueService,
    private readonly voucherAppliedMerchantRepository: VoucherAppliedMerchantService,
    private readonly bikeVoucherService: BikeVoucherService,
    private readonly deliveryVoucherService: DeliveryVoucherService
  ) {}
  async create(createVoucherDto: CreateVoucherDto): Promise<any> {
    try {
      let result;
     switch(createVoucherDto.service_type) {
      case ServiceType.delivery: result = await this.deliveryVoucherService.create(createVoucherDto);
      break;
      case ServiceType.bike: result = await this.bikeVoucherService.create(createVoucherDto);
      break;
     }
     return result;
    } catch (error: any) {
      this.logger.log(`Error: ${error}`);
      this.logger.log(`Error: ${error.message}`);
    }
  }

  async findAll(): Promise<Voucher[]> {
    try {
      const vouchers = await this.voucherRepository.find();
      const transformedVouchers = vouchers.map((voucher) => ({
        ...voucher,
        discount_type: this.findEnumKeyByEnumValue(
          DiscountType,
          voucher.discount_type
        ),
        free_shipping_condition: this.findEnumKeyByEnumValue(
          FreeShippingType,
          voucher.free_shipping_condition
        ),
        service_type: this.findEnumKeyByEnumValue(
          ServiceType,
          voucher.service_type
        ),
        appear_type: this.findEnumKeyByEnumValue(
          AppearType,
          voucher.appear_type
        )
      }));

      return Object.assign({
        data: transformedVouchers,
        statusCode: 200,
        status: `success`,
      });
    } catch (error: any) {
      this.logger.log(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình lấy Voucher`,
        error: error.message,
      });
    }
  }

  async findByCode(code: string): Promise<Voucher | undefined> {
    const result = await this.voucherRepository.findOne({ where: { code } });
    return result;
  }


  async findOne(id: number): Promise<Voucher> {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: id },
      });
      this.logger.log(`Found ${voucher}`);
      if (voucher) {
        const transformedVouchers = {
          ...voucher,
          discount_type: this.findEnumKeyByEnumValue(
            DiscountType,
            voucher.discount_type
          ),
          free_shipping_condition: this.findEnumKeyByEnumValue(
            FreeShippingType,
            voucher.free_shipping_condition
          ),
          service_type: this.findEnumKeyByEnumValue(
            ServiceType,
            voucher.service_type
          ),
          appear_type: this.findEnumKeyByEnumValue(
            AppearType,
            voucher.appear_type
          )
        };
        return Object.assign({
          data: transformedVouchers,
          statusCode: 200,
          status: `success`,
        });
      } else {
        return Object.assign({
          data: {},
          statusCode: 204,
          status: `Voucher has #${id} not found`,
        });
      }
    } catch (error: any) {
      this.logger.log(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình lấy Voucher`,
        error: error.message,
      });
    }
  }

  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto
  ): Promise<Voucher> {
    {
      try {
        const existing = await this.voucherRepository.findOne({
          where: { id: id },
        });
        if (existing) {
          const checkDate = this.isDateRangeValid(
            updateVoucherDto.start_date,
            updateVoucherDto.end_date
          );
          if (checkDate) {
            await this.voucherRepository.update(id, updateVoucherDto);
            const result = await this.voucherRepository
              .createQueryBuilder("voucher")
              .where("voucher.id = :id", { id })
              .getOne();
            return Object.assign({
              data: result,
              statusCode: 201,
              status: `success`,
            });
          } else {
            return Object.assign({
              status: `Error: Giá trị Ngày bắt đầu không được quá ngày kết thúc`,
            });
          }
        } else {
          return Object.assign({
            data: {},
            statusCode: 204,
            status: `Voucher has #${id} not found`,
          });
        }
      } catch (error: any) {
        this.logger.log(`Error: ${error.message}`);
        return Object.assign({
          status: `error`,
          message: `Đã xảy ra lỗi trong quá trình update Voucher`,
          error: error.message,
        });
      }
    }
  }

  async remove(id: number):Promise<any> {
    try {
      const existing = await this.voucherRepository.findOne({
        where: { id: id },
      });
      if (!existing) {
        return Object.assign({
          data: {},
          statusCode: 404,
          status: 'Error',
          message: `Không tìm thấy Voucher có ID là #${id}`,
        });
      } else {
        const code = existing.code;
        await this.voucherRepository.delete(id);
        await this.voucherAppliedMerchantRepository.removeMerchantByCode(code);
        return Object.assign({
          status: `success`,
          message: `Đã Xóa Voucher`,
        });
      }

    } catch (error:any) {
      this.logger.log(`Error: ${error.message}`);
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

  async checkVoucher(
    order_price: number,
    shipping_fee: number,
    promotion_code: string,
    customer_id: string,
    merchantId: string,
    service_type: string,
  ): Promise<any> {
    try {
      let result ;
      switch (service_type) {
        case ServiceType.delivery: result = await this.deliveryVoucherService.delivery_check_voucher(
          order_price,
          shipping_fee,
          promotion_code,
          customer_id,
          merchantId,
          )
         break;
         case ServiceType.bike: result = await this.bikeVoucherService.bike_check_voucher(
          order_price,
          shipping_fee,
          promotion_code,
          customer_id,
          merchantId,
          )
         break;
         default:
        throw Error('No supported this service type');
      }
      return result;
    } catch (error: any) {
      this.logger.log(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        error: error.message,
        data: {
          promotion_status: `error`,
          promotion_message: `Đã xảy ra lỗi trong quá trình kiểm tra Voucher`,
        },
      });
    }
  }


  //Lấy Key trong Enumerable
  findEnumKeyByEnumValue(enumObject: any, enumValue: any) {
    const result = Object.keys(enumObject).find(
      (key) => enumObject[key] === enumValue
    );
    return result;
  }

  //Kiểm tra khoảng thời gian
  async isDateRangeValid(startDate: Date, endDate: Date): Promise<boolean> {
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();
    if (endDateTime > startDateTime) {
      return true;
    }
    return false;
  }
  //Các voucher có thể sử dụng
  async isAvailableVouchers(input: InputCheckAvailableVoucher): Promise<any> {
    try {
      
            var arr = [];
      const currentDateTime = new Date();
      const stillValidVoucher = await this.voucherRepository
        .createQueryBuilder("voucher")
        .where("voucher.end_date >= :currentDateTime", { currentDateTime })
        .andWhere("voucher.service_type = :serviceType", { serviceType: input.service_type })
        .andWhere("(voucher.appear_type = '1' OR voucher.appear_type = '2')")
        .getMany();
        console.log(`--**--**--**--**--**--**--**--**--**--`);
      for (const voucher of stillValidVoucher) {
        const checkData = await this.checkVoucher(
          input.order_price,
          input.shipping_fee,
          voucher.code,
          input.customer_id,
          input.merchants_id,
          input.service_type,
        );
        if (checkData.status == "success") {
          arr.push({
            code: voucher.code,
            description: voucher.description,
            is_available: true,
          });
        }
      }
      console.log(stillValidVoucher );

     

      //Thêm Mã code không sử dụng được, hiện tại lấy theo chỉ voucher có giá trị tối thiểu
      const unavailableCodes = stillValidVoucher
      .filter(voucher => voucher.discount_type === "2")
      .filter(voucher => !arr.some(item => item.code === voucher.code))
      .map(voucher => ({
          code: voucher.code,
          description: voucher.description,
          is_available: false,
      }));
      console.log(`--**--**--**--**--**--**--**--**--**--`);
      
     arr.push(...unavailableCodes);
     console.log(arr );
      return arr;

    } catch (error: any) {
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình kiểm tra Voucher`,
        error: error.message,
      });
    }
  }

  
}
