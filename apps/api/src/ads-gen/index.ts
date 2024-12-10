import { CompanySizeModule } from './company-size/company-size.module';
import { CompanyTypeModule } from './company-type/company-type.module';
import { IndustryModule } from './industry/industry.module';
import { LanguageModule } from './language/language.module';
import { PlatformModule } from './platform/platform.module';
import { ToneModule } from './tone/tone.module';

export const adsGenModules = [
  LanguageModule,
  PlatformModule,
  ToneModule,
  IndustryModule,
  CompanySizeModule,
  CompanyTypeModule,
];
