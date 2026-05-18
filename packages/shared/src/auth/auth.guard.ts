import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_ROUTE_KEY } from './constants';
import { SharedAuthClientService } from './auth-client.service';
import type { AuthenticatedRequest } from './types';

const extractBearerToken = (authorizationHeader: string | string[] | undefined): string => {
  if (typeof authorizationHeader !== 'string') {
    throw new UnauthorizedException('Authorization header is required.');
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedException('Authorization header must use Bearer token.');
  }

  return token;
};

@Injectable()
export class SharedAuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly sharedAuthClientService: SharedAuthClientService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);
    const payload = await this.sharedAuthClientService.validateAccessToken(token);

    request.auth = payload;
    request.user = payload;

    return true;
  }
}
