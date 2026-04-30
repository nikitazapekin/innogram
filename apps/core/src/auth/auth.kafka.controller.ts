import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthKafkaController {
  @EventPattern('auth.core.stub')
  handleAuthStub(@Payload() _message: unknown): void {}
}
