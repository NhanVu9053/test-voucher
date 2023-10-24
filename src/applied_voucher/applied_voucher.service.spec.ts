import { Test, TestingModule } from '@nestjs/testing';
import { AppliedVoucherService } from './applied_voucher.service';

describe('AppliedVoucherService', () => {
  let service: AppliedVoucherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppliedVoucherService],
    }).compile();

    service = module.get<AppliedVoucherService>(AppliedVoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
