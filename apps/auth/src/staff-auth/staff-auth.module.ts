import { Module } from '@nestjs/common';
import { StaffAuthController } from './staff-auth.controller';

@Module({
  controllers: [StaffAuthController],
})
export class StaffAuthModule {}
