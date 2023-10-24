import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { CreateAppliedVoucherDto } from './dto/create-appliedVoucher.dto';
import { AppliedVoucher } from './entities/applied_voucher.entity';

@Injectable()
export class AppliedVoucherService {
  constructor(
    @InjectRepository(AppliedVoucher)
    private appliedVoucherRepository: Repository<AppliedVoucher>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async countUsedVouchers(voucherCode: string): Promise<number> {
    const query = this.appliedVoucherRepository
      .createQueryBuilder()
      .select('COUNT(*)')
      .from(AppliedVoucher, 'av')
      .where('av.code = :voucherCode', { voucherCode });
    const count = await query.getRawOne();
    return count[Object.keys(count)[0]];
  }

  //TODO: Xử lý khi thành công đơn hàng thì mới insert vào bảng kiểm tra số lượt sử dụng
  async applyVoucher(appliedVoucherDto: CreateAppliedVoucherDto){
    const appliedVoucher = new AppliedVoucher();
    appliedVoucher.code = appliedVoucherDto.code;
    appliedVoucher.user_id = appliedVoucherDto.user_id;
    await this.appliedVoucherRepository.save(appliedVoucher);
  }
}
