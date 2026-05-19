import { DynamicModule, Module } from '@nestjs/common';

import { SHARED_AUTH_OPTIONS, SharedAuthOptions } from './auth-config';
import { SharedAuthGuard } from './auth.guard';
import { SharedJwksClientService } from './jwks-client.service';

@Module({})
export class SharedAuthModule {
  public static forRoot(options: SharedAuthOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      providers: [
        {
          provide: SHARED_AUTH_OPTIONS,
          useValue: options,
        },
        SharedJwksClientService,
        SharedAuthGuard,
      ],
      exports: [SharedAuthGuard, SharedJwksClientService],
    };
  }
}
