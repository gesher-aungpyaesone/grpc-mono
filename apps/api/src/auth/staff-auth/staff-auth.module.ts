import { Module } from '@nestjs/common';
import { StaffAuthController } from './staff-auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.STAFF_JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [StaffAuthController],
})
export class StaffAuthModule {}
