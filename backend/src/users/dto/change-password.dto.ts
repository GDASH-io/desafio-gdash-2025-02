import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/utils/password-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description:
      'Nova senha do usuário (mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial)',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    message:
      'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial',
  })
  password: string;
}

