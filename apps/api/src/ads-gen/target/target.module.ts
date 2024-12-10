import { Module } from '@nestjs/common';
import { TargetController } from './target.controller';

@Module({
  controllers: [TargetController],
})
export class TargetModule {}
