import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class FindAuthUserQueryDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;
}
