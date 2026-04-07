import { UserEntity } from '../../common/entities/user.entity';
import { IsBoolean, IsString, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';

export class ValidateTokenResponseDto {
  @IsBoolean()
  @IsNotEmpty()
  isValid: boolean;

  @ValidateNested()
  user: UserEntity;

  @IsString()
  @IsOptional()
  message?: string;
}
