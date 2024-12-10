import { Module } from '@nestjs/common';
import { AdsGenController } from './ads-gen.controller';
import { AdsGenService } from './ads-gen.service';
import { ConfigModule } from '@nestjs/config';
import { AdsGenPrismaModule } from '@app/ads-gen-prisma';
import { LanguageModule } from './language/language.module';
import { PlatformModule } from './platform/platform.module';
import { ToneModule } from './tone/tone.module';
import { IndustryModule } from './industry/industry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdsGenPrismaModule,
    LanguageModule,
    PlatformModule,
    ToneModule,
    IndustryModule,
  ],
  controllers: [AdsGenController],
  providers: [AdsGenService],
})
export class AdsGenModule {}
