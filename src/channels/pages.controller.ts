import { Controller, Get, Param, Query, Render, Res, Post, NotFoundException, Body } from '@nestjs/common';
import type { Response } from 'express';
import { ChannelsService } from './channels.service';

@Controller()
export class PageController {

  constructor(private readonly channelsService: ChannelsService) {}

  @Get('/')
  redirectToFeed(@Res() res: Response) {
    return res.redirect('/channels/feed/1');
  }

  @Get('channels/feed/:id')
  @Render('feed_all_channels')
  async getFeed(@Param('id') id: string, @Query('next') next?: string) {
    const idChannel = Number(id);
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

  @Post('channels/add')
  async createDraft(
    @Body() body: { name: string, coverUrl?: string, videoUrl?: string },
    @Res() res: Response
  ) {
    await this.channelsService.createDraft(1, body.name, body.coverUrl, body.videoUrl);
    return res.redirect('/channels/add');
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