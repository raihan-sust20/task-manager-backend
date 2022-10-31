import { SetMetadata } from '@nestjs/common';

export const ArgsPath = (argsPath: string[]) => SetMetadata('argsPath', argsPath);
