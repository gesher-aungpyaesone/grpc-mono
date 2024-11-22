import { Global, Module } from '@nestjs/common';
import {
  PermissionService,
  StaffPermissionService,
  StaffPositionService,
  StaffService,
  UserService,
} from './auth';

@Global()
@Module({
  providers: [
    UserService,
    PermissionService,
    StaffPositionService,
    StaffService,
    StaffPermissionService,
  ],
  exports: [
    UserService,
    PermissionService,
    StaffPositionService,
    StaffService,
    StaffPermissionService,
  ],
})
export class PrismaModule {}
