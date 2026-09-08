import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { PageController } from './pages.controller';

@Module({
  controllers: [PageController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
