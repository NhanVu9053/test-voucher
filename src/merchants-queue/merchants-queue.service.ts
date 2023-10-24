import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { catchError, lastValueFrom, map, of, throwError } from 'rxjs';

@Injectable()
export class MerchantsQueueService {
    constructor(
        @Inject('merchants-queue-module') private readonly client: ClientProxy,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
      ) {}
    
      public async send(pattern: string, data: any) {
        this.logger.log(`send message '${pattern}'`, MerchantsQueueService.name);
        const result = this.client.send(pattern, data).pipe(
          catchError(error => {
            return of({ 
              status: 'error',
              error: 'An error occurred during message sending.' });
          }),
          map(response => {
            return response;
          })
        );
        const response = await lastValueFrom(result);
        return response;
      }
      public emit(pattern: string, data: any) {
        this.logger.log(`emit message '${pattern}'`, MerchantsQueueService.name);
        this.client.emit(pattern, data).pipe(catchError(error => throwError(() => new RpcException(error.message))));
      }  
}
