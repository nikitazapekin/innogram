import { DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CLIENT_TOKENS, getNatsServers } from '@innogram/shared';

type ClientToken = (typeof CLIENT_TOKENS)[keyof typeof CLIENT_TOKENS];

export function createNatsClientModule(name: ClientToken): DynamicModule {
  return ClientsModule.register([
    {
      name,
      transport: Transport.NATS,
      options: {
        servers: getNatsServers(),
      },
    },
  ]);
}
