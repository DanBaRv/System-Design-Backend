import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { PageController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './serviceChannel.entity'
import { Like } from './likeChannel.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Like])],   
  controllers: [PageController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
