import { Module } from '@nestjs/common';
import { ContentTypeController } from './content-type.controller';

@Module({
  controllers: [ContentTypeController],
})
export class ContentTypeModule {}
