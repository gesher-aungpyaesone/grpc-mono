import { Global, Module } from '@nestjs/common';
import {
  AuthPrismaService,
  GroupService,
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
    GroupService,
  ],
  exports: [
    UserService,
    PermissionService,
    StaffPositionService,
    StaffService,
    StaffPermissionService,
    GroupService,
  ],
})
export class PrismaModule {}
