import { Module } from '@nestjs/common';
import { CompanyTypeController } from './company-type.controller';

@Module({
  controllers: [CompanyTypeController],
})
export class CompanyTypeModule {}
