import { Module } from '@nestjs/common';
import { CompanySizeController } from './company-size.controller';

@Module({
  controllers: [CompanySizeController],
})
export class CompanySizeModule {}
