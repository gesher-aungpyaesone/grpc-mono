import { GroupPermissionModule } from './group-permission/group-permission.module';
import { GroupModule } from './group/group.module';
import { PermissionModule } from './permission/permission.module';
import { StaffAuthModule } from './staff-auth/staff-auth.module';
import { StaffDepartmentModule } from './staff-department/staff-department.module';
import { StaffGroupModule } from './staff-group/staff-group.module';
import { StaffPermissionModule } from './staff-permission/staff-permission.module';
import { StaffPositionModule } from './staff-position/staff-position.module';
import { StaffModule } from './staff/staff.module';
import { UserModule } from './user/user.module';

export const authModules = [
  PermissionModule,
  UserModule,
  StaffAuthModule,
  StaffPositionModule,
  StaffDepartmentModule,
  StaffModule,
  StaffPermissionModule,
  GroupModule,
  GroupPermissionModule,
  StaffGroupModule,
];
