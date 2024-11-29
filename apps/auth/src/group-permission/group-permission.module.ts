import { Module } from '@nestjs/common';
import { GroupPermissionController } from './group-permission.controller';

@Module({
  controllers: [GroupPermissionController]
})
export class GroupPermissionModule {}
