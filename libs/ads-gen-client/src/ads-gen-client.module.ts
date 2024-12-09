import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ADS_GEN_GRPC_OPTION } from 'configs';
import { ADS_GEN_PACKAGE_NAME } from 'protos/dist/ads-gen';
import * as grpc from '@grpc/grpc-js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: ADS_GEN_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          ...ADS_GEN_GRPC_OPTION,
          url: process.env.ADS_GEN_MS_URL,
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
export class AdsGenClientModule {}
