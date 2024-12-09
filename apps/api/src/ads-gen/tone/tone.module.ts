import { Module } from '@nestjs/common';
import { ToneController } from './tone.controller';

@Module({
  controllers: [ToneController],
})
export class ToneModule {}
