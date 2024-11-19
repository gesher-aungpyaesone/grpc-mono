import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { StaffModule } from './staff/staff.module';
import { PrismaModule } from '@app/prisma';
import { StaffPositionModule } from './staff-position/staff-position.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StaffModule,
    StaffPositionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
