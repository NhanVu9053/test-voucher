import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VoucherAppliedMerchantService } from './voucher-applied-merchant.service';
import { CreateVoucherAppliedMerchantDto } from './dto/create-voucher-applied-merchant.dto';
import { UpdateVoucherAppliedMerchantDto } from './dto/update-voucher-applied-location.dto';

@Controller('voucher-applied-merchant')
export class VoucherAppliedMerchantController {
  constructor(private readonly voucherAppliedLocationsService: VoucherAppliedMerchantService) {}

  @Post()
  create(@Body() createVoucherAppliedLocationDto: CreateVoucherAppliedMerchantDto) {
    return this.voucherAppliedLocationsService.create(createVoucherAppliedLocationDto);
  }

  @Get()
  findAll() {
    return this.voucherAppliedLocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voucherAppliedLocationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoucherAppliedLocationDto: UpdateVoucherAppliedMerchantDto) {
    return this.voucherAppliedLocationsService.update(+id, updateVoucherAppliedLocationDto);
  }

}
