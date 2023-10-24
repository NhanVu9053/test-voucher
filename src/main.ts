import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import logger from './logger';

async function bootstrap() {
    // Create an HTTP server
    const httpServer = await NestFactory.create(AppModule, {
      logger
    });
    httpServer.enableCors();
    httpServer.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }));
    await httpServer.listen(3000, () => {});
  
    // Create a microservice
    const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      logger,
      transport: Transport.RMQ,
      options: {
        urls: process.env.RABBITMQ_URLS.split(' '),
        queue: process.env.LACO_VOUCHER_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
      
    });
    await microservice.listen();
}
bootstrap();
