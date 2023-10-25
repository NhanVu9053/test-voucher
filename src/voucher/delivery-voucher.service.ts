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
import { isDateRangeValid } from "../utils/DateRangeValid"
import { VoucherService } from "./voucher.service";
import { UtilsVoucherService } from "./utils-voucher.service";
@Injectable()
export class DeliveryVoucherService {
  private readonly logger = new Logger(DeliveryVoucherService.name);
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
          return {
            message: `Error: Mã code đã tồn tại`,
        };
        }
        //hiện tại discout_type đang gán 2 giá trị ở bikes-voucher
        if(!(parseInt(createVoucherDto.discount_type) > 0 && parseInt(createVoucherDto.discount_type) <= 4)){
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
              description: `Giảm ${createVoucherDto.discount_percent}% giá trị đơn hàng. Có giá trị đến ${end_date_string} `,
              discount_percent: createVoucherDto.discount_percent,
              discount_value: null, // Bỏ trường discount_value
              minimum_order_value: null, // Bỏ trường minimum_order_value
            };
            break;
           case "2":
             voucherModel = {
              ...createVoucherDto,
              description: `Giảm ${createVoucherDto.discount_value} đồng cho đơn tối thiểu ${createVoucherDto.minimum_order_value} đồng. Có giá trị đến ${end_date_string}`,
              discount_value: createVoucherDto.discount_value,
              minimum_order_value: createVoucherDto.minimum_order_value,
              discount_percent: null, // Bỏ trường discount_percent
            };
            break;
            case "3":
              voucherModel = {
               ...createVoucherDto,
               description: `FREESHIP ${createVoucherDto.discount_value} đồng cho đơn tối thiểu ${createVoucherDto.minimum_order_value} đồng. Có giá trị đến ${end_date_string}`,
               discount_value: createVoucherDto.discount_value,
               minimum_order_value: createVoucherDto.minimum_order_value,
               discount_percent: null, // Bỏ trường discount_percent
             };
             break;
            case DiscountType.DiscountByFreeShipPercent:
              voucherModel = {
               ...createVoucherDto,
               description: `Miễn phí  ${createVoucherDto.discount_percent}% giá vận chuyển cho đơn tối thiểu ${createVoucherDto.minimum_order_value} đồng. Có giá trị đến ${end_date_string}`,
               discount_percent: createVoucherDto.discount_percent,
               minimum_order_value: createVoucherDto.minimum_order_value,
               discount_value: null, // Bỏ trường discount_value
             };
             break;
        }       
        const voucher = this.voucherRepository.create(voucherModel);
        const result = await this.voucherRepository.save(voucher);
        if (createVoucherDto.merchant_ids != null && createVoucherDto.is_for_specified_merchants == true) {
          const arr = await this.utilsService.checkExistenceMerchant(
            createVoucherDto.merchant_ids
          );
          await Promise.all(
            arr.map(async (merchantId) => {
              const voucherAppliedMerchantModel = {
                code: createVoucherDto.code,
                merchant_id: merchantId,
              };
              await this.voucherAppliedMerchantRepository.create(
                voucherAppliedMerchantModel
              );
            })
          );
        }
        return result;
      
    } catch (error: any) {
      this.logger.log(`Error: ${error}`);
      this.logger.log(`Error: ${error.message}`);
    }
  }
  async delivery_check_voucher(
    order_price: number,
    shipping_fee: number,
    promotion_code: string,
    customer_id: string,
    merchantId: string
  ): Promise<any> {
    try {
      // console.log(`delivery-voucher: checking...`);
      var checkData = await this.utilsService.getVoucherByCode(promotion_code);
      // console.log(`delivery-voucher: checkData${JSON.stringify(checkData)}`);
      if (!checkData.check) {
        return {
          status: "error",
          data: {
            promotion_status: `invalid`,
            promotion_message: "Voucher không áp dụng thành công",
          },
        };
      }
      if (checkData.data.is_for_specified_merchants) {
        const isForSpecified =
          await this.voucherAppliedMerchantRepository.checkFindMerchantByCode(
            promotion_code,
            merchantId
          );
        if (!isForSpecified) {
          return {
            status: "error",
            data: {
              promotion_status: `Mã ${promotion_code} không áp dụng cho cửa hàng này`,
              promotion_message: "Voucher không áp dụng thành công",
            },
          };  
        } 
        const result = await this.processVoucher(
          order_price,
          shipping_fee,
          promotion_code,
          checkData,
          customer_id
        );
        return result;
      } else {
        const result = await this.processVoucher(
          order_price,
          shipping_fee,
          promotion_code,
          checkData,
          customer_id
        );

        return result;
      }
    } catch (error: any) {
      this.logger.log(`Error: ${error}`);
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

  async processVoucher(
    order_price: number,
    shipping_fee: number,
    promotion_code: string,
    voucherData:any,
    customer_id: string
  ): Promise<any> {
    try {
      var checkCountData = await this.appliedVoucherService.countUsedVouchers(
        promotion_code
      );
      // Kiểm tra hạn sử dụng của voucher
      if (voucherData == null) {
        return {
          status: "error",
          data: {
            promotion_status: `invalid`,
            promotion_message: "Voucher không áp dụng thành công",
          },
        };
      } 
      const currentDateTime = new Date();
      const orderWithinPromotionTimeRange =
        await this.utilsService.isOrderWithinPromotionTimeRange(
          voucherData.data.start_date,
          voucherData.data.end_date,
          currentDateTime
        );
      //kiểm tra thời gian voucher
      if (!orderWithinPromotionTimeRange) {
        return {
          status: "error",
          data: {
            promotion_status: `expired`,
            promotion_message: "Voucher không áp dụng thành công",
          },
        };
      } 
      if (voucherData.data.usage_limit === 0) {
        return await this.handleDiscountType(
          voucherData,
          promotion_code,
          order_price,
          shipping_fee
        );
      } else {
        const checkUsages = await this.utilsService.isCheckVoucherUsage(
          voucherData.data.usage_limit, // Số lượt tối đa
          checkCountData // Số lượt đã sử dụng
        );
        if (!checkUsages) {
          return {
            status: "error",
            data: {
              promotion_status: `out-of-used-counting`,
              promotion_message: "Voucher không áp dụng thành công",
            },
          };
        } 
        return await this.handleDiscountType(
          voucherData,
          promotion_code,
          order_price,
          shipping_fee
        );
      }
    } catch (error: any) {
      this.logger.log(`Error: ${error}`);
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

  //Xử lý từng trường hợp giảm giá
   async handleDiscountType(
    checkData: any,
    promotion_code: string,
    order_price: number,
    freeShipFeenumbers: number
  ) {
    try {
    switch (checkData.data.discount_type) {
      // Thực hiện hành động khi discountType = '1' (DiscountByPercent) 
      case '1':
        const outputDiscountPercent = await this.utilsService.calculateDiscountPercent(
          promotion_code,
          order_price,
          checkData.data.discount_percent,
        );
        return Object.assign({
          status: "success",
          data: outputDiscountPercent,
        });
      case '2':
        // Thực hiện hành động khi discountType = '2' (DiscountByMiniOrder)
        if (order_price >= checkData.data.minimum_order_value) {
          const outputDiscountMiniOrder =
            await this.utilsService.calculateDiscountMiniumOrder(
              promotion_code,
              checkData.data.discount_value
            );
          return Object.assign({
            status: "success",
            data: outputDiscountMiniOrder,
          });
        } else {
          return Object.assign({
            status: "error",
            message: `Đơn hàng chưa đạt giá trị tối thiểu`,
          });
        }
      case '3':
        // Thực hiện hành động khi discountType = '3' (DiscountByFreeShip)
        const outputDiscountFreeShip = await this.utilsService.calculateDiscountForShip(
          promotion_code,
          checkData.data.discount_value,
          freeShipFeenumbers
        );
        return Object.assign({
          status: "success",
          data: outputDiscountFreeShip,
        });
      case '4':
        // Thực hiện hành động khi discountType = '4' (DiscountByFreeShip)
        const outputDiscountFreeShipPercent = await this.utilsService.calculateDiscountForShipByPercent(
          promotion_code,
          checkData.data.discount_percent,
          freeShipFeenumbers
        );
        return Object.assign({
          status: "success",
          data: outputDiscountFreeShipPercent,
        });
        default: return Object.assign(
          { 
            message: `No implemented voucher for delivery service`,
          }); 
    }
    } catch (error:any) {
      this.logger.log(`error: ${error}`);
    }
  }
}