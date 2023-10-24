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
      case "1": result = await this.deliveryVoucherService.create(createVoucherDto);
      case "2": result = await this.bikeVoucherService.create(createVoucherDto);
     }
     return result;
    } catch (error: any) {
      this.logger.log(`Error: ${error}`);
      this.logger.log(`Error: ${error.message}`);
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình tạo Voucher`,
        error: error.message,
      });
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
    merchantId: string
  ): Promise<any> {
    try {
      var checkData = await this.getVoucherByCode(promotion_code);
      if (checkData.check == true) {
        if (checkData.data.is_for_specified_merchants == true) {
          const isForSpecified =
            await this.voucherAppliedMerchantRepository.checkFindMerchantByCode(
              promotion_code,
              merchantId
            );
          if (isForSpecified == true) {
            const result = await this.processVoucher(
              order_price,
              shipping_fee,
              promotion_code,
              checkData,
              customer_id
            );
            return result;
          } else {
            return Object.assign({
              status: "error",
              data: {
                promotion_status: `Mã ${promotion_code} không áp dụng cho cửa hàng này`,
                promotion_message: "Voucher không áp dụng thành công",
              },
            });
          }
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
      } else {
        return Object.assign({
          status: "error",
          data: {
            promotion_status: `invalid`,
            promotion_message: "Voucher không áp dụng thành công",
          },
        });
      }
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
      if (voucherData != null) {
        const currentDateTime = new Date();
        const orderWithinPromotionTimeRange =
          await this.isOrderWithinPromotionTimeRange(
            voucherData.data.start_date,
            voucherData.data.end_date,
            currentDateTime
          );
        //kiểm tra thời gian voucher
        if (orderWithinPromotionTimeRange) {
          if (voucherData.data.usage_limit === 0) {
            return await this.handleDiscountType(
              voucherData,
              promotion_code,
              order_price,
              shipping_fee
            );
          } else {
            this.logger.log("checkData.data.usage_limit > 0");
            const checkUsages = await this.isCheckVoucherUsage(
              voucherData.data.usage_limit, // Số lượt tối đa
              checkCountData // Số lượt đã sử dụng
            );
            if (checkUsages) {
              return await this.handleDiscountType(
                voucherData,
                promotion_code,
                order_price,
                shipping_fee
              );
            } else {
              return Object.assign({
                status: "error",
                data: {
                  promotion_status: `out-of-used-counting`,
                  promotion_message: "Voucher không áp dụng thành công",
                },
              });
            }
          }
        } else {
          return Object.assign({
            status: "error",
            data: {
              promotion_status: `expired`,
              promotion_message: "Voucher không áp dụng thành công",
            },
          });
        }
      } else {
        return Object.assign({
          status: "error",
          data: {
            promotion_status: `invalid`,
            promotion_message: "Voucher không áp dụng thành công",
          },
        });
      }
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
        const outputDiscountPercent = await this.calculateDiscountPercent(
          promotion_code,
          order_price,
          checkData.data.discount_percent,
          freeShipFeenumbers
        );
        return Object.assign({
          status: "success",
          data: outputDiscountPercent,
        });
      case '2':
        // Thực hiện hành động khi discountType = '2' (DiscountByMiniOrder)
        if (order_price >= checkData.data.minimum_order_value) {
          const outputDiscountMiniOrder =
            await this.calculateDiscountMiniumOrder(
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
        const outputDiscountFreeShip = await this.calculateDiscountForShip(
          promotion_code,
          checkData.data.discount_value,
          freeShipFeenumbers
        );
        this.logger.log(`case:3 ${JSON.stringify(outputDiscountFreeShip)}`)
        return Object.assign({
          status: "success",
          data: outputDiscountFreeShip,
        });
      case '4':
        // Thực hiện hành động khi discountType = '4' (DiscountByFreeShip)
        const outputDiscountFreeShipPercent = await this.calculateDiscountForShipByPercent(
          promotion_code,
          checkData.data.discount_percent,
          freeShipFeenumbers
        );
        this.logger.log(`case:4 ${JSON.stringify(outputDiscountFreeShipPercent)}`)
        return Object.assign({
          status: "success",
          data: outputDiscountFreeShipPercent,
        });
    }
    } catch (error:any) {
      this.logger.log(`error: ${error}`);
    }
  }

  //Lấy Key trong Enumerable
  findEnumKeyByEnumValue(enumObject: any, enumValue: any) {
    const result = Object.keys(enumObject).find(
      (key) => enumObject[key] === enumValue
    );
    return result;
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

  //Kiểm tra thời gian order có thuộc trong thời gian sử dụng voucher
  async isOrderWithinPromotionTimeRange(
    start_date,
    end_date,
    order_time
  ): Promise<boolean> {
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

  //Kiểm tra khoảng thời gian
  async isDateRangeValid(startDate: Date, endDate: Date): Promise<boolean> {
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();
    if (endDateTime > startDateTime) {
      return true;
    }
    return false;
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
    freeShipFeenumbers: number
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

  //Các voucher có thể sử dụng
  async isAvailableVouchers(input: InputCheckAvailableVoucher): Promise<any> {
    try {
      var arr = [];
      const currentDateTime = new Date();
      const stillValidVoucher = await this.voucherRepository
        .createQueryBuilder("voucher")
        .where("voucher.end_date >= :currentDateTime", { currentDateTime })
        .getMany();
      for (const voucher of stillValidVoucher) {
        const checkData = await this.checkVoucher(
          input.order_price,
          input.shipping_fee,
          voucher.code,
          input.customer_id,
          input.merchants_id
        );
        if (checkData.status == "success") {
          arr.push({
            code: voucher.code,
            description: voucher.description,
            is_available: true,
          });
        }
      }

      //Thêm Mã code không sử dụng được, hiện tại lấy theo chỉ voucher có giá trị tối thiểu
      const unavailableCodes = stillValidVoucher
      .filter(voucher => voucher.discount_type === "2")
      .filter(voucher => !arr.some(item => item.code === voucher.code))
      .map(voucher => ({
          code: voucher.code,
          description: voucher.description,
          is_available: false,
      }));
     arr.push(...unavailableCodes);
      return arr;
    } catch (error: any) {
      return Object.assign({
        status: `error`,
        message: `Đã xảy ra lỗi trong quá trình kiểm tra Voucher`,
        error: error.message,
      });
    }
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
