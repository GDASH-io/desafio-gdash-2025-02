import { SetMetadata } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';

export const IS_PUBLIC_KEY = commonConstants.decorators.IS_PUBLIC;
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
