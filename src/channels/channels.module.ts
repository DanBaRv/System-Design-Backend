import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { PageController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './serviceChannel.entity'
import { Like } from './likeChannel.entity'
import { User } from './userChannel.entity'
import { ApiController } from './api.controller';
import { UsersService } from './users.service';
import { FilesService } from './files.service';
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Channel, Like, User])],
    controllers: [ApiController, PageController, UsersController], 
    providers: [ChannelsService, UsersService, FilesService],   
})
export class ChannelsModule {}
