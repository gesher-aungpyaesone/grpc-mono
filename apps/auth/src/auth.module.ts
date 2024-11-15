import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { StaffModule } from './staff/staff.module';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StaffModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
