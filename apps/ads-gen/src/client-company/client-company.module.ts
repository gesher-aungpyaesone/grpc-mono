import { Module } from '@nestjs/common';
import { ClientCompanyController } from './client-company.controller';

@Module({
  controllers: [ClientCompanyController],
})
export class ClientCompanyModule {}
