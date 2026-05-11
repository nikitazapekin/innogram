import { Body, Controller, Post } from '@nestjs/common';

type AuthPayload = Readonly<{
  login: string;
  password: string;
}>;

const getCoreUrl = (): string => process.env.CORE_URL || 'http://localhost:3001';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() body: AuthPayload): Promise<{ ok: true }> {
    await this.forward('/auth/login', body);

    return { ok: true };
  }

  @Post('register')
  async register(@Body() body: AuthPayload): Promise<{ ok: true }> {
    await this.forward('/auth/register', body);

    return { ok: true };
  }

  private async forward(path: string, payload: AuthPayload): Promise<void> {
    const response = await fetch(`${getCoreUrl()}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Core request failed with status ${response.status}.`);
    }
  }
}
