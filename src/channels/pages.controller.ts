import { Controller, Get, Param, Query, Render, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { ChannelsService } from './channels.service';

@Controller()
export class PageController {

  constructor(private readonly channelsService: ChannelsService) {}

  @Get('/')
  redirectToFeed(@Res() res: Response) {
    return res.redirect('/feed/1')//редерикт на каналы 1
  }

  @Get('feed/:id')
  @Render('feed')
  getFeed(@Param('id') id: string, @Query('next') next?: string)
  {
    const idChannel = Number(id)
    const channel = next === 'true'
    ?this.channelsService.getNextChannel(idChannel)
    :this.channelsService.getChannel(idChannel)

    if(!channel){
    throw new NotFoundException('Канал не найден');}
    return { channel, activePage: 'feed' }; 
  }

  @Get('add')
  @Render('add')
  getAddPage(){
    const draftChannel = this.channelsService.getDraft()
    return {draftChannel,activePage : 'add'}
  }

  @Get('catalog')
  @Render('catalog')
  getCatalogPage(@Query('minSubscribers') minSubscribers? : string){
    const minSubscribersChannel =minSubscribers=== undefined ? undefined : Number(minSubscribers)

    const catalogChannels = this.channelsService.getCatalog(minSubscribersChannel)
    return {catalogChannels, currentFilter: minSubscribersChannel ?? '', activePage: 'catalog'}
  }
}