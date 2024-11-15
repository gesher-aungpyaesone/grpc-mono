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

@Controller()
export class AppController implements OnModuleInit {
  private authHealthService: AuthHealthServiceClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc,
    private readonly appService: AppService,
  ) {}

  onModuleInit() {
    this.authHealthService = this.client.getService<AuthHealthServiceClient>(
      AUTH_HEALTH_SERVICE_NAME,
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
}
