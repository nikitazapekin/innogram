import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildNatsRecord,
  CLIENT_TOKENS,
  SUBJECTS,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '@innogram/shared';
import { randomUUID } from 'node:crypto';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AuthGatewayService implements OnModuleInit {
  constructor(
    @Inject(CLIENT_TOKENS.authClient)
    private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async validateToken(payload: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    const requestId = randomUUID();
    const headers = {
      'x-request-id': requestId,
      'x-origin': 'core-microservice',
      'x-entrypoint': 'API_GATEWAY',
    };

    const response = await firstValueFrom<ValidateTokenResponse>(
      this.client
        .send(SUBJECTS.validateToken, buildNatsRecord(payload, headers))
        .pipe(timeout(5000)),
    );

    return response;
  }
}
