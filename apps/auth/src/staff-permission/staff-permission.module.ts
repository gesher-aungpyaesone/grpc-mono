import { Module } from '@nestjs/common';
import { StaffPermissionController } from './staff-permission.controller';

@Module({
  controllers: [StaffPermissionController],
})
export class StaffPermissionModule {}
