import { join } from 'path';
import { ADS_GEN_PACKAGE_NAME } from 'protos/dist/ads-gen';
import { AUTH_PACKAGE_NAME } from 'protos/dist/auth';

export const AUTH_GRPC_OPTION = {
  package: AUTH_PACKAGE_NAME,
  protoPath: join(__dirname, '../../../protos/auth.proto'),
  loader: {
    keepCase: true,
    includeDirs: [__dirname, '../../../protos'],
  },
};

export const ADS_GEN_GRPC_OPTION = {
  package: ADS_GEN_PACKAGE_NAME,
  protoPath: join(__dirname, '../../../protos/ads-gen.proto'),
  loader: {
    keepCase: true,
    includeDirs: [__dirname, '../../../protos'],
  },
};
