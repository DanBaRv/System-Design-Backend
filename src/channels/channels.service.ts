import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Channel, ChannelStatus  } from './serviceChannel.entity'
import { Like } from './likeChannel.entity'
import { Not } from 'typeorm'
import { MoreThanOrEqual } from 'typeorm';
import { DataSource } from 'typeorm'

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
        return this.channelsRepository.find({where})
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
            await this.dataSource.query(
                'UPDATE channel SET status = $1 WHERE id = $2',
                ['deleted',id]
            )
        }

}