import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import { LanguageService, PlatformService } from './ads-gen';

@Global()
@Module({
  providers: [AdsGenPrismaService, LanguageService, PlatformService],
  exports: [AdsGenPrismaService, LanguageService, PlatformService],
})
export class AdsGenPrismaModule {}
