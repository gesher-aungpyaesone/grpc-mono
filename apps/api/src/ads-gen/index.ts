import { ClientCompanyModule } from './client-company/client-company.module';
import { CompanySizeModule } from './company-size/company-size.module';
import { CompanyTypeModule } from './company-type/company-type.module';
import { ContentTypeModule } from './content-type/content-type.module';
import { IndustryModule } from './industry/industry.module';
import { LanguageModule } from './language/language.module';
import { PlatformModule } from './platform/platform.module';
import { TargetModule } from './target/target.module';
import { ToneModule } from './tone/tone.module';

export const adsGenModules = [
  LanguageModule,
  PlatformModule,
  ToneModule,
  IndustryModule,
  CompanySizeModule,
  CompanyTypeModule,
  TargetModule,
  ClientCompanyModule,
  ContentTypeModule,
];
