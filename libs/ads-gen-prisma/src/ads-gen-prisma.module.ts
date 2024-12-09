import { Global, Module } from '@nestjs/common';
import { AdsGenPrismaService } from './ads-gen-prisma.service';
import { LanguageService } from './ads-gen';

@Global()
@Module({
  providers: [AdsGenPrismaService, LanguageService],
  exports: [AdsGenPrismaService, LanguageService],
})
export class AdsGenPrismaModule {}
