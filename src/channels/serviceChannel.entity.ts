import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm'
import { Like } from './likeChannel.entity';
import { User } from './userChannel.entity';

export enum ChannelStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DELETED = 'deleted',
}

@Entity('channel')
export class Channel{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length : 50})
    name: string;

    @Column({type: 'varchar',length : 50, nullable: true })
    username: string | null ;

    @Column({type: 'varchar', length : 100, nullable: true })
    topic: string | null ;

    @Column({ type: 'int', default: 0 })
    subscribersCount: number;

    @Column({ type: 'int', default: 0 })
    averageReach: number;

    @Column({ type: 'int', default: 0 })
    adPrice: number;

    @Column({ type: 'int', default: 0 })
    repostsCount: number;

    @Column({ type: 'int', default: 0 })
    commentsCount: number;

    @Column({ type: 'varchar', length: 300, nullable: true  })
    description: string | null;

    @Column({
        type: 'enum',
        enum: ChannelStatus,
        default: ChannelStatus.DRAFT,
    })
    status: ChannelStatus;

    @Column({ type: 'varchar',length: 250, nullable: true })
    coverUrl: string| null;

    @Column({ type: 'varchar',length: 250, nullable: true })
    videoUrl: string| null;

    @Column({ type: 'int', nullable: true })
    nextId: number | null;

    @Column({ type: 'timestamp' })
    channelCreated: Date;

    @Column({ type: 'timestamp', nullable: true })
    channelFormed: Date | null;

    @Column()
    creatorId: number;

    
    @OneToMany(() => Like, (like) => like.channels)
    likes:Like[]

    @ManyToOne(() => User,(user) => user.channels)
    @JoinColumn({name : "creatorId"})
    users:User
    /*
    Service — класс
    service — переменная внутри функции
    service.likes — указывает на свойство likes: Like[] в Service
    */
}