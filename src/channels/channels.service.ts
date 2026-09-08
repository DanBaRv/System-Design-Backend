import { Injectable } from '@nestjs/common';
import { channels, Channels } from './channels.data';

@Injectable()
export class ChannelsService {
    private readonly channels: Channels[] = channels

    getChannel(id:number){
        return this.channels.find(c => c.id === id) 
    }

    getNextChannel(id:number){
        const channel = this.channels.find(c => c.id === id)
        if (!channel) return undefined  
        const nextChannel = this.channels.find(c=> c.id === channel.nextId)
        return nextChannel
    }

    getDraft(){
        const takeDraft = this.channels.find(c => c.status === "draft")
        return takeDraft
    }

    getCatalog(minSubscribers?: number) {
        return this.channels.filter(c =>
            c.status === 'published' &&
            (minSubscribers === undefined || c.subscribersCount >= minSubscribers)
    )
}
}


