import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import {
  ClientCompanyService,
  CompanySizeService,
  CompanyTypeService,
  ContentTypeService,
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
    ContentTypeService,
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
    ContentTypeService,
  ],
})
export class AdsGenPrismaModule {}
