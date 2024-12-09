import { Controller, Get } from '@nestjs/common';
import { AdsGenService } from './ads-gen.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ADS_GEN_HEALTH_SERVICE_NAME,
  AdsGenHealthCheckResponse,
} from 'protos/dist/ads-gen';

@Controller()
export class AdsGenController {
  constructor(private readonly adsGenService: AdsGenService) {}

  @Get()
  getHello(): string {
    return this.adsGenService.getHello();
  }

  @GrpcMethod(ADS_GEN_HEALTH_SERVICE_NAME, 'check')
  check(): AdsGenHealthCheckResponse {
    return { status: true };
  }
}
