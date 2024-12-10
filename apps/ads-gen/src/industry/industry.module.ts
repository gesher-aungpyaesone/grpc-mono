import { Module } from '@nestjs/common';
import { IndustryController } from './industry.controller';

@Module({
  controllers: [IndustryController],
})
export class IndustryModule {}
