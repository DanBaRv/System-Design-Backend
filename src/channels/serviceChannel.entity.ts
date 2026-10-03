import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm'
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

    @Column({ type: 'int', nullable: true })
    subscribersCount: number | null;

    @Column({ type: 'int',nullable: true })
    averageReach: number | null;

    @Column({ type: 'varchar', length: 300, nullable: true  })
    description: string | null;

    @Column({
        type: 'enum',
        enum: ChannelStatus,
        default: ChannelStatus.DRAFT,
    })
    status: ChannelStatus;

    @Column({ type: 'varchar',length: 250})
    coverUrl: string;

    @Column({ type: 'varchar',length: 250})
    videoUrl: string;

    @Column({ type: 'int', nullable: true })
    nextId: number | null;

    @Column({ type: 'timestamp' })
    channelCreated: Date;

    @Column()
    creatorId: number;

    @Column({ type: 'timestamp', nullable: true })
    channelFormed: Date | null;


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