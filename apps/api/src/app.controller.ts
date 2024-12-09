import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  AUTH_HEALTH_SERVICE_NAME,
  AUTH_PACKAGE_NAME,
  AuthHealthCheckResponse,
  AuthHealthServiceClient,
} from 'protos/dist/auth';
import {
  ADS_GEN_HEALTH_SERVICE_NAME,
  ADS_GEN_PACKAGE_NAME,
  AdsGenHealthCheckResponse,
  AdsGenHealthServiceClient,
} from 'protos/dist/ads-gen';

@Controller()
export class AppController implements OnModuleInit {
  private authHealthService: AuthHealthServiceClient;
  private adsGenHealthService: AdsGenHealthServiceClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private authClient: ClientGrpc,
    @Inject(ADS_GEN_PACKAGE_NAME) private adsGenClient: ClientGrpc,
    private readonly appService: AppService,
  ) {}

  onModuleInit() {
    this.authHealthService =
      this.authClient.getService<AuthHealthServiceClient>(
        AUTH_HEALTH_SERVICE_NAME,
      );

    this.adsGenHealthService =
      this.adsGenClient.getService<AdsGenHealthServiceClient>(
        ADS_GEN_HEALTH_SERVICE_NAME,
      );
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('auth/health')
  checkAuthHealth(): Observable<AuthHealthCheckResponse> {
    return this.authHealthService.check({});
  }

  @Get('ads-gen/health')
  checkAdsGenHealth(): Observable<AdsGenHealthCheckResponse> {
    return this.adsGenHealthService.check({});
  }
}
