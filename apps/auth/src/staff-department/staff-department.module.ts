import { Module } from '@nestjs/common';
import { StaffDepartmentController } from './staff-department.controller';

@Module({
  controllers: [StaffDepartmentController],
})
export class StaffDepartmentModule {}
