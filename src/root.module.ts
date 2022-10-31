import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';

/**
 * The root Module for the backend service. Hosts the {@link ApiModule}.
 */

@Module({
  imports: [
    ApiModule,
  ],
})
export class RootModule {}
