import { Global, Module } from '@nestjs/common';
import { StaffAuthController } from './staff-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { StaffAuthService } from './staff-auth.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.STAFF_JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [StaffAuthController],
  providers: [StaffAuthService],
  exports: [StaffAuthService],
})
export class StaffAuthModule {}
