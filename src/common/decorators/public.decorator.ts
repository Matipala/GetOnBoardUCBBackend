import { SetMetadata } from '@nestjs/common';
//para definir rutas publicas
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
