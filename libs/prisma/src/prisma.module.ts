import { Global, Module } from '@nestjs/common';
import {
  AuthPrismaService,
  PermissionService,
  StaffPermissionService,
  StaffPositionService,
  StaffService,
  UserService,
} from './auth';

@Global()
@Module({
  providers: [
    AuthPrismaService,
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
