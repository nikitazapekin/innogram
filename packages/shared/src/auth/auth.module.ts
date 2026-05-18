import { DynamicModule, Module } from '@nestjs/common';

import {
  SHARED_AUTH_CLIENT_OPTIONS,
  SharedAuthClientOptions,
  SharedAuthClientService,
} from './auth-client.service';

@Module({})
export class SharedAuthModule {
  public static forRoot(options: SharedAuthClientOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      providers: [
        {
          provide: SHARED_AUTH_CLIENT_OPTIONS,
          useValue: options,
        },
        SharedAuthClientService,
      ],
      exports: [SharedAuthClientService],
    };
  }
}
