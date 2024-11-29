import { Module } from '@nestjs/common';
import { StaffGroupController } from './staff-group.controller';

@Module({
  controllers: [StaffGroupController]
})
export class StaffGroupModule {}
