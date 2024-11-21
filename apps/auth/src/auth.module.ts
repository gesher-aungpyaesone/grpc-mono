import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { StaffModule } from './staff/staff.module';
import { PrismaModule } from '@app/prisma';
import { StaffPositionModule } from './staff-position/staff-position.module';
import { StaffAuthModule } from './staff-auth/staff-auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StaffModule,
    StaffPositionModule,
    StaffAuthModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
