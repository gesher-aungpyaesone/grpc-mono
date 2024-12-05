import { Global, Module } from '@nestjs/common';
import {
  AuthPrismaService,
  GroupPermissionService,
  GroupService,
  PermissionService,
  StaffDepartmentService,
  StaffGroupService,
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
    StaffDepartmentService,
    StaffService,
    StaffPermissionService,
    GroupService,
    GroupPermissionService,
    StaffGroupService,
  ],
  exports: [
    UserService,
    PermissionService,
    StaffPositionService,
    StaffDepartmentService,
    StaffService,
    StaffPermissionService,
    GroupService,
    GroupPermissionService,
    StaffGroupService,
  ],
})
export class PrismaModule {}
