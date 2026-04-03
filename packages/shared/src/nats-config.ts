import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { getNatsServers } from './constants';

export function createNatsServerOptions(queue: string): MicroserviceOptions {
  return {
    transport: Transport.NATS,
    options: {
      servers: getNatsServers(),
      queue,
      gracefulShutdown: true,
      gracePeriod: 1000,
    },
  };
}
