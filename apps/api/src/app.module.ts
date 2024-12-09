import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthClientModule } from '@app/auth-client';
import { ConfigModule } from '@nestjs/config';
import { authModules } from './auth';
import { AdsGenClientModule } from '@app/ads-gen-client';
import { adsGenModules } from './ads-gen';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthClientModule,
    ...authModules,
    AdsGenClientModule,
    ...adsGenModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
