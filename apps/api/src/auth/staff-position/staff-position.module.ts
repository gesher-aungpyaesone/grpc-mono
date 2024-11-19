import { Module } from '@nestjs/common';
import { StaffPositionController } from './staff-position.controller';

@Module({
  controllers: [StaffPositionController],
})
export class StaffPositionModule {}
