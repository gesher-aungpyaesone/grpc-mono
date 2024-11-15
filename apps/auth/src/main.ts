import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_GRPC_OPTION } from 'configs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.GRPC,
      options: {
        ...AUTH_GRPC_OPTION,
        url: process.env.AUTH_MS_URL,
      },
    },
  );
  await app.listen();
}
bootstrap();
