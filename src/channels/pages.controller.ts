import { Controller, Get, Param, Query, Render, Res, Post, NotFoundException, Body } from '@nestjs/common';
import type { Response } from 'express';
import { ChannelsService } from './channels.service';
import { UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { FilesService } from './files.service'
import { CurrentUser } from './current-user'

@Controller()
export class PageController {

  constructor(private readonly channelsService: ChannelsService,
    private readonly filesService: FilesService, 
  ) {}

  @Get('/')
  redirectToFeed(@Res() res: Response) {
    return res.redirect('/channels/feed/1');
  }

  @Get('channels/feed/:id')
  @Render('feed_all_channels')
  async getFeed(@Param('id') id: string, @Query('next') next?: string) {
    console.log('FEED ЗАПРОС: id =', JSON.stringify(id), '| next =', next)
    
    const idChannel = Number(id);
    if (Number.isNaN(idChannel)) {
    throw new NotFoundException('Некорректный id канала')
}
    const channel = next === 'true'
      ? await this.channelsService.getNextChannel(idChannel)
      : await this.channelsService.getChannel(idChannel);

    if (!channel) {
      throw new NotFoundException('Канал не найден');
    }
    
    return { 
      channel, 
      likes: await this.channelsService.getLikesForChannel(channel.id),
      activePage: 'feed_all_channels' 
    }; 
  }

  @Get('channels/add')
  @Render('add_channel')
  async getAddPage() {
    const draftChannel = await this.channelsService.getDraftOfChannel(1);
    return { draftChannel, activePage: 'add_channel' };
  }

  @Get('channels/catalog')
  @Render('catalog_of_channels')
  async getCatalogPage(@Query('minSubscribers') minSubscribers?: string) {
    const minSubscribersChannel = minSubscribers === undefined ? undefined : Number(minSubscribers);

    const catalogChannels = await this.channelsService.getCatalogOfChannels(minSubscribersChannel);
    return { 
      catalogChannels, 
      currentFilter: minSubscribersChannel ?? '', 
      activePage: 'catalog_of_channels' 
    };
  }

  //создание черновкиа, загрузка фото видео имени и тд
@Post('channels/add')
@UseInterceptors(FileFieldsInterceptor([
    { name: 'cover', maxCount: 1 },
    { name: 'video', maxCount: 1 },
]))
async createDraft(
    @UploadedFiles() files: { cover?: Express.Multer.File[], video?: Express.Multer.File[] },
    @Body() body: { name: string },
    @Res() res: Response,
) {
    const cover = files.cover?.[0]
    const video = files.video?.[0]
    if (!body.name) throw new BadRequestException('Название обязательно')

    const coverName = cover ? await this.filesService.uploadFile(cover) : 'default_cover.jpg'
    const videoName = video ? await this.filesService.uploadFile(video) : 'default_video.mp4'

    await this.channelsService.createDraft(
        CurrentUser.getInstance().id,     
        body.name, coverName, videoName,
    )
    return res.redirect('/channels/add')
}

  @Post('channels/publish')
  async changeStatusPublish(
    @Body() body: {
      name: string;
      subscribersCount: number;
      averageReach: number;
      description?: string;
    },
    @Res() res: Response,
  ) {
    await this.channelsService.changePubl(
      1,                       
      body.name,                 
      Number(body.subscribersCount),  
      Number(body.averageReach),                    
      body.description,                              
    );
    return res.redirect('/channels/feed/1');
  }

  @Post('channels/delete')
  async deleteChannel(@Body() body: { id: number }, @Res() res: Response) {
    await this.channelsService.deleteChannel(Number(body.id));
    return res.redirect('/channels/catalog');
  }
}