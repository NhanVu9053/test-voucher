import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MerchantsQueueService } from './merchants-queue.service';
require('dotenv').config();
@Module({
  imports: [ClientsModule.register([
    {
      name: 'merchants-queue-module',
      transport: Transport.RMQ,
      options: {
        urls: process.env.RABBITMQ_URLS.split(' '),
        queue: process.env.LACO_MERCHANTS_QUEUE,
        queueOptions: {
          durable: false
        }
      },
    },
  ]),],
  providers: [MerchantsQueueService],
  exports: [MerchantsQueueService]
})
export class MerchantsQueueModule {}
