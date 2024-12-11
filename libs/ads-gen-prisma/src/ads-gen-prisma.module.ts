import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import {
  ClientCompanyService,
  CompanySizeService,
  CompanyTypeService,
  IndustryService,
  LanguageService,
  PlatformService,
  TargetService,
  ToneService,
} from './ads-gen';

@Global()
@Module({
  providers: [
    AdsGenPrismaService,
    LanguageService,
    PlatformService,
    ToneService,
    IndustryService,
    CompanySizeService,
    CompanyTypeService,
    TargetService,
    ClientCompanyService,
  ],
  exports: [
    AdsGenPrismaService,
    LanguageService,
    PlatformService,
    ToneService,
    IndustryService,
    CompanySizeService,
    CompanyTypeService,
    TargetService,
    ClientCompanyService,
  ],
})
export class AdsGenPrismaModule {}
