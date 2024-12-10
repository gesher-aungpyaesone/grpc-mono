import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import {
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
  ],
  exports: [
    AdsGenPrismaService,
    LanguageService,
    PlatformService,
    ToneService,
    IndustryService,
  ],
})
export class AdsGenPrismaModule {}
