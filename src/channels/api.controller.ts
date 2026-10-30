import {
    Controller, Get, Post, Put, Delete,UseGuards,
    Param, Query, Body,
    UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ChannelsService } from './channels.service'
import { UsersService } from './users.service'
import { FilesService } from './files.service'
import { CurrentUser } from './current-user'
import type { Multer } from 'multer'
import { NotFoundException } from '@nestjs/common';
import { AuthGuard } from './auth.guard'
import { ApiOperation, ApiOkResponse, ApiBearerAuth,ApiConsumes, ApiBody,ApiTags} from '@nestjs/swagger'
import { Channel } from './serviceChannel.entity'

@ApiTags('Домен услуг')
@Controller('api/channels')
export class ApiController{
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly filesService: FilesService,
    ) {}



    // GET /api/channels/draft
    //прочитать черновик есть он или его нет
    @ApiOperation({summary : 'Чтение последнего черновик канала, при его наличии'})
    @ApiOkResponse({description:'Данные канала'})
    @Get('draft')
    async getDraft(){
        const draftChannel = await this.channelsService.getDraftOfChannel(CurrentUser.getInstance().id)
        return draftChannel
    }

    //получение канала по id
@ApiOperation({ summary: 'Лента: без id — с начала, с id — конкретный канал'})
@ApiOkResponse({ description: 'Данные канала + количество лайков + признак isMine' })
@Get('feed')
async getFeed(
    @Query('id') id?: string,
    @Query('next') next?: string,
) {
    let channel: Channel | null

    if (id === undefined) {
        channel = await this.channelsService.getFirstFeedChannel()
    } else {
        // «Лента по ид» (+ ?next=true — следующий по кольцу)
        const idChannel = Number(id)
        if (Number.isNaN(idChannel)) {
            throw new NotFoundException('Некорректный id канала')
        }

        channel = next === 'true'
            ? await this.channelsService.getNextChannel(idChannel)
            : await this.channelsService.getChannel(idChannel)
    }

    if (!channel) {
        throw new NotFoundException('Канал не найден')
    }

    const likes = await this.channelsService.getLikesForChannel(channel.id)   // ← от channel.id!
    const isMine = channel.creatorId === CurrentUser.getInstance().id ? 1 : 0

    return { ...channel, likes, isMine }
}
    /*
    //получение канала без id
    @ApiOperation({summary:"Получение канала без ID"})
    @ApiOkResponse({description:"Вывод данных первого канала"})
    @Get('feed')
    async getFeedStart() {
        const channel = await this.channelsService.getFirstFeedChannel()
        const likes = await this.channelsService.getLikesForChannel(channel.id)
        return { ...channel, likes }
    }*/



    //выести каталог каналов с мин количеством подписчиков(может быть 0, выведем всех)
    @ApiOperation({summary:"Вывод каталога каналов с фильтром"})
    @ApiOkResponse({description:"Массив опубликованных услуг с признаком isMine'"})
    @Get()
    async getCatalog(@Query('minSubscribers') minSubscribers?: string){
        const minSubscribersChannel = minSubscribers === undefined ? undefined : Number(minSubscribers);
        const catalogChannels = await this.channelsService.getCatalogOfChannels(minSubscribersChannel);
        return { 
            catalogChannels
        };
    }

    //////////////////////////////////////////////////////////////////////Измененния//////////////////////////////////////////////////////////////////////////
    /*@Post('add')
    async createDraft(
        @Body() body: { name: string, coverUrl?: string, videoUrl?: string },
    ){
        return await this.channelsService.createDraft(CurrentUser.getInstance().id, body.name, body.coverUrl, body.videoUrl);
    }*/

    //создать черновик
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создание черновика канала' })
    @ApiConsumes('multipart/form-data') 
    @ApiBody({ description: 'Поля: name (строка), cover (файл), video (файл)' })
    @UseGuards(AuthGuard)
    @Post('add')//декоратор
    @UseInterceptors(
        FileFieldsInterceptor([//ожидаем multipart/form-data с полясм видео и фото по 1 шт
            /*
            пример
            POST /channels/add
            Content-Type: multipart/form-data

            name: "Мой канал"
            cover: <файл картинки>
            video: <файл видео>
            */
            { name: 'cover', maxCount: 1 },
            { name: 'video', maxCount: 1 },
    ]))

    //FileFieldsInterceptor всешда возвращает массив с файлами даже если там один файл
    /*
    пример
      cover: [
    {
      originalname: 'cover.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer,
      size: 123456,
      fieldname: 'cover'
    },
    ...
    ]
    аналогично для видео
    */

    async createDraft(
        @UploadedFiles() files: {
            cover?: Express.Multer.File[]//загрузили в переменные массив то есть тот самый один файл
            video?: Express.Multer.File[]
        },
        @Body() body: { name: string },
    ) {
        const cover = files.cover?.[0]     // файлы приходят массивами — берём первый
        const video = files.video?.[0]

        if (!cover || !video) {
            throw new BadRequestException('Нужны оба файла: обложка и видео')
        }

        const coverName = await this.filesService.uploadFile(cover)
        const videoName = await this.filesService.uploadFile(video)

        return this.channelsService.createDraft(
            CurrentUser.getInstance().id,
            body.name,
            coverName,
            videoName,
        )
    }
//////////////////////////////////////////////////////////////////////Измененния//////////////////////////////////////////////////////////////////////////

    //опубликовать канал
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Публикация услуги (смена статуса)' })
    @ApiOkResponse({ description: 'Опубликованный канал' })
    @UseGuards(AuthGuard)
    @Put('publish')
    async changeStatusPublish(
    @Body() body: {
        name: string;
        subscribersCount: number;
        averageReach: number;
        description?: string;
    },
    ) {
    return await this.channelsService.changePubl(
        CurrentUser.getInstance().id,
        body.name,                 
        Number(body.subscribersCount),  
        Number(body.averageReach),                    
        body.description,                              
    );
    }

    //удаление
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Удаление канала' })
    @ApiOkResponse({ description: 'Сообщение об успехе' })
    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteChannel(@Param('id') id : string, @Body() body : {}) {
        await this.channelsService.deleteChannel(Number(id));
        return { success: true };
    }

    //поставить лайк
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Поставить лайк каналу' })
    @ApiOkResponse({ description: 'Количество лайков текущего канала' })
    @UseGuards(AuthGuard)
    @Post(':id/like')
    async getLike(@Param('id') id:string, @Body() body: { value: 0|1}){
        const idChannel = Number(id)
        const likes = await this.channelsService.setLikes(idChannel,body.value)
        return { likes } 
    }
}