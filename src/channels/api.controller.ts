import {
    Controller, Get, Post, Put, Delete,
    Param, Query, Body,
    UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ChannelsService } from './channels.service'
import { UsersService } from './users.service'
import { FilesService } from './files.service'
import { CurrentUser } from './current-user'
import type { Multer } from 'multer'

@Controller('api/channels')
export class ApiController{
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
    ) {}



    // GET /api/channels/draft
    //прочитать черновик есть он или его нет
    @Get('draft')
    async getDraft(){
        const draftChannel = await this.channelsService.getDraftOfChannel(CurrentUser.getInstance().id)
        return draftChannel
    }

    //получение канала по id
    @Get('feed/:id')
    async getFeed(@Param('id') id: string){
        const channelId = Number(id)
        const feedChannel = await this.channelsService.getChannel(channelId)
        return feedChannel
    }

    //выести каталог каналов с мин количеством подписчиков(может быть 0, выведем всех)
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
    @Post('add')
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
    @Delete(':id')
    async deleteChannel(@Param('id') id : string, @Body() body : {}) {
        await this.channelsService.deleteChannel(Number(id));
        return { success: true };
    }

    //поставить лайк
    @Post(':id/like')
    async getLike(@Param('id') id:string, @Body() body: { value: 0|1}){
        const idChannel = Number(id)
        const likes = await this.channelsService.setLikes(idChannel,body.value)
        return { likes } 
    }

    //регистрация
    @Post('registration')
    async registrationUser(@Body() body: {name:string, email:string, password:string}){
        await this.usersService.registrationUser(body.name,body.email,body.password)
        return { message: 'Пользователь зарегистрирован' }
    }

    //аутентификация
    @Post('auth')
    async authUser(@Body() body: {email:string,password:string}){
        return await this.usersService.authUser(body.email,body.password)
    }

    //деаутентификация
    @Post('logout')
    async logout() {
        return { message: 'Деавторизация будет реализована в ЛР4' }
    }
}