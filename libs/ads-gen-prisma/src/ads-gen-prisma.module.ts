import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import { LanguageService, PlatformService, ToneService } from './ads-gen';

@Global()
@Module({
  providers: [
    AdsGenPrismaService,
    LanguageService,
    PlatformService,
    ToneService,
  ],
  exports: [AdsGenPrismaService, LanguageService, PlatformService, ToneService],
})
export class AdsGenPrismaModule {}
