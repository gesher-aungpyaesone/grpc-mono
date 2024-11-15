import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_GRPC_OPTION } from 'configs';
import { AUTH_PACKAGE_NAME } from 'protos/dist/auth';
import * as grpc from '@grpc/grpc-js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          ...AUTH_GRPC_OPTION,
          url: process.env.AUTH_MS_URL,
          credentials:
            process.env.NODE_ENV === 'production'
              ? grpc.credentials.createSsl()
              : grpc.credentials.createInsecure(),
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class AuthClientModule {}
