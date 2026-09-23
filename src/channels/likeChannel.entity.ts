import {Entity, Column, PrimaryGeneratedColumn,ManyToOne,JoinColumn, CreateDateColumn} from 'typeorm'
import { Channel } from './serviceChannel.entity';
import { User } from './userChannel.entity';

@Entity('likes')
export class Like{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    channelId: number;

    @Column()
    userId:number;

    @ManyToOne(() => Channel, (channel) => channel.likes)
    @JoinColumn({name : "channelId"})
    channels:Channel

    @ManyToOne(() => User, (user) => user.likes)
    @JoinColumn({name : "userId"})
    user:User
}