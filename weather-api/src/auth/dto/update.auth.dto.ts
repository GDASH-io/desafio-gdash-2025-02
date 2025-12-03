import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './signUp.dto';

export class UpdateAuthDto extends PartialType(SignUpDto) {}
