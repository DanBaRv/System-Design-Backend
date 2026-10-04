import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Channel, ChannelStatus  } from './serviceChannel.entity'
import { Like } from './likeChannel.entity'
import { Not } from 'typeorm'
import { MoreThanOrEqual } from 'typeorm';
import { DataSource } from 'typeorm'
import { CurrentUser } from './current-user'

@Injectable()
export class ChannelsService {

  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    private dataSource: DataSource,
  ) {}

    async getChannel (id : number): Promise<Channel | null >{
        const channel = await this.channelsRepository.findOneBy({
            id,
            status : ChannelStatus.PUBLISHED
        })
        if (!channel) {
            throw new NotFoundException("error in the next channel id");
        }
        return channel;
    }

    async getNextChannel (id : number): Promise<Channel | null >{
        const channel = await this.channelsRepository.findOneBy({
            id,
            status : ChannelStatus.PUBLISHED
        })
        if (!channel) {
            throw new NotFoundException("error in the next channel id");
        }
        if (!channel.nextId) {
            return null; 
        }
        return this.channelsRepository.findOneBy({id: channel.nextId})
    }

    async getDraftOfChannel(creatorId:number): Promise <Channel | null> {
        const channelDraft = await this.channelsRepository.findOneBy({
            status: ChannelStatus.DRAFT,
            creatorId
        })
        if (!channelDraft) {
            return null
        }
        return channelDraft
    }

    async getCatalogOfChannels(minSubscribers?: number): Promise < Channel[ ]>{
       const where: any = {
            status : ChannelStatus.PUBLISHED
        }
        if (minSubscribers !== undefined) {
            where.subscribersCount = MoreThanOrEqual(minSubscribers)
        }
        const channels = await this.channelsRepository.find({where})

        const currentUserId  =  CurrentUser.getInstance().id

        return channels.map(channel => ({
            ...channel,
            isMine: channel.creatorId === currentUserId? 1:0
        }))
    }

    async getLikesForChannel(id: number): Promise <number>{
        const where : any = {
            channelId : id
        }
        const findLikesChannel = await this.likesRepository.find({where})
        return findLikesChannel.length
    }

    async createDraft(creatorId:number, name:string, coverUrl?:string, videoUrl?:string): Promise <Channel>{
        const existing = await this.channelsRepository.findOneBy({creatorId,status :  ChannelStatus.DRAFT})
        if (existing) {
            return existing
        }

        const draftChannel = await this.channelsRepository.save({
            name,
            coverUrl: coverUrl,
            videoUrl: videoUrl,
            status: ChannelStatus.DRAFT,
            creatorId,
            channelCreated: new Date(),
            subscribersCount: null,
            averageReach: null,
        })

        return draftChannel
    }

    async changePubl(creatorId:number, name: string,subscribersCount:number, 
        averageReach: number, description?: string): Promise <Channel>{
        const findDraft = await this.channelsRepository.findOneBy({
            creatorId,
            status:ChannelStatus.DRAFT
        })

        if (!findDraft) {
            throw new NotFoundException("error");
        }

        const changePublStatus = await this.channelsRepository.save({
            id: findDraft.id,
            status : ChannelStatus.PUBLISHED,
            channelFormed: new Date(),
            name,
            subscribersCount,
            averageReach,
            description,
        })

        return changePublStatus
    }

    async deleteChannel(id:number):Promise <void>{
        const channel = await this.channelsRepository.findOneBy({id})//нашли канал=> нашли кто его создал
        
        if (!channel) //есть ли вообще кнала
        {
            throw new NotFoundException('Канал не найден')
        }

        if (channel.creatorId !== CurrentUser.getInstance().id) {//проверка кто его удаляет те только хозяин
            throw new ForbiddenException('Можно удалять только свои услуги')
        }

        await this.dataSource.query(
            'UPDATE channel SET status = $1 WHERE id = $2',
            ['deleted',id]
        )
    }

    async setLikes(id:number,value:number) : Promise <number> {
        //+берем id
        //+ищем пост
        //+смотрим количество лайков
        //смотри что в Body
        //извлекаем value

        //+если 1 то есть истина то проверяем был ли 
        //+поставлен лайк 
        // уже если да то ничего не делаем 
        //если не было лайка ставим лайк +1

        const where : any = {
            channelId : id
        }
        const findedChannel = await this.likesRepository.find({where})
        const lenLikeChannel = findedChannel.length

        const existing = await this.likesRepository.findOneBy({//по факту это позиция лайка то есть кто поставил и под каким каналом
            userId:CurrentUser.getInstance().id ,
            channelId : id

        })

        if (value === 1)
        {
            if (!existing){//если лайк уже стоит удаляем лайк -1
                await this.likesRepository.save(
                    {
                        userId:CurrentUser.getInstance().id ,
                        channelId : id
                    }
                )
            }
        }
        else if(existing){//если 0 ТО удаляем лайк 
                await this.likesRepository.remove(existing)
        }
        
        return this.getLikesForChannel(id)
    }
}