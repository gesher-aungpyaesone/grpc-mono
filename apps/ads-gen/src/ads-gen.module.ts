import { Module } from '@nestjs/common';
import { AdsGenController } from './ads-gen.controller';
import { AdsGenService } from './ads-gen.service';
import { ConfigModule } from '@nestjs/config';
import { AdsGenPrismaModule } from '@app/ads-gen-prisma';
import { LanguageModule } from './language/language.module';
import { PlatformModule } from './platform/platform.module';
import { ToneModule } from './tone/tone.module';
import { IndustryModule } from './industry/industry.module';
import { CompanySizeModule } from './company-size/company-size.module';
import { CompanyTypeModule } from './company-type/company-type.module';
import { TargetModule } from './target/target.module';
import { ClientCompanyModule } from './client-company/client-company.module';
import { ContentTypeModule } from './content-type/content-type.module';

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
    CompanySizeModule,
    CompanyTypeModule,
    TargetModule,
    ClientCompanyModule,
    ContentTypeModule,
  ],
  controllers: [AdsGenController],
  providers: [AdsGenService],
})
export class AdsGenModule {}
