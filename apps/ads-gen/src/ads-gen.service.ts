import { Injectable } from '@nestjs/common';

@Injectable()
export class AdsGenService {
  getHello(): string {
    return '[ADS-GEN] Hello World!';
  }
}
