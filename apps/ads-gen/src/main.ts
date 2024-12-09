import { NestFactory } from '@nestjs/core';
import { AdsGenModule } from './ads-gen.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ADS_GEN_GRPC_OPTION } from 'configs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AdsGenModule,
    {
      transport: Transport.GRPC,
      options: {
        ...ADS_GEN_GRPC_OPTION,
        url: process.env.ADS_GEN_MS_URL,
      },
    },
  );
  await app.listen();
}
bootstrap();
