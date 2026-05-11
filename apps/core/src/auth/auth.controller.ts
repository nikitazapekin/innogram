import { Body, Controller, Post } from '@nestjs/common';

type AuthPayload = Readonly<{
  login: string;
  password: string;
}>;

@Controller()
export class AuthController {
  @Post('auth/login')
  handleLogin(@Body() body: AuthPayload): { ok: true } {
    return { ok: true };
  }

  @Post('auth/register')
  handleRegister(@Body() body: AuthPayload): { ok: true } {
    return { ok: true };
  }
}
