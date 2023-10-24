import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { VoucherModule } from './voucher/voucher.module';
import { AppliedVoucherModule } from './applied_voucher/applied_voucher.module';
import * as winston from 'winston';
import * as path from 'path';
import { dataSourceOptions } from './config/typeOrm.config';
import { VoucherService } from './voucher/voucher.service';
import { AppliedVoucherService } from './applied_voucher/applied_voucher.service';
import { VoucherController } from './voucher/voucher.controller';
import { Voucher } from './voucher/entities/voucher.entity';
import { AppliedVoucher } from './applied_voucher/entities/applied_voucher.entity';
import { VoucherAppliedMerchantModule } from './voucher-applied-merchant/voucher-applied-merchant.module';
import { MerchantsQueueModule } from './merchants-queue/merchants-queue.module';
import { BikeVoucherService } from './voucher/bike-voucher.service';
import { DeliveryVoucherService } from './voucher/delivery-voucher.service';
import { UtilsVoucherService } from './voucher/utils-voucher.service';
require('dotenv').config();
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forFeature([Voucher]),TypeOrmModule.forFeature([AppliedVoucher]),
    WinstonModule.forRoot({
      defaultMeta: { service: 'user-service' },
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY/MM/DD HH:mm:ss'
        }),
        winston.format.printf(({ level, message, defaultMeta, timestamp, stack, trace }) => {
          return `${timestamp} [${defaultMeta}] ${level}: ${message} ${stack ? stack : ''} ${trace ? trace : ''}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: path.join(__dirname, './../logs/debug/'), //path to where save loggin result 
          filename: 'debug.log', //name of file where will be saved logging result
          level: 'debug',
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../logs/error/'),
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../logs/info/'),
          filename: 'info.log',
          level: 'info',
        }),
      ],
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    VoucherModule,
    AppliedVoucherModule,
    VoucherAppliedMerchantModule,
    MerchantsQueueModule
  ],
  controllers: [AppController,VoucherController],
  providers: [AppService,
              VoucherService,
              AppliedVoucherService,
              BikeVoucherService,
              DeliveryVoucherService,
              UtilsVoucherService
            ],
})
export class AppModule {}
