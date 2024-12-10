import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import {
  CompanySizeService,
  CompanyTypeService,
  IndustryService,
  LanguageService,
  PlatformService,
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
  ],
  exports: [
    AdsGenPrismaService,
    LanguageService,
    PlatformService,
    ToneService,
    IndustryService,
    CompanySizeService,
    CompanyTypeService,
  ],
})
export class AdsGenPrismaModule {}
