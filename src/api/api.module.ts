import { Module } from '@nestjs/common';
import { V1Module } from './v1/v1.module';

/**
 * The base API module for the backend service. Hosts the {@link V1Module}.
 */
@Module({
  imports: [
    V1Module
  ],
})
export class ApiModule {}
