import {Entity, Column, PrimaryGeneratedColumn,OneToMany, JoinColumn} from 'typeorm'
import {Like} from './likeChannel.entity'
import {Channel} from './serviceChannel.entity'

@Entity('users')
export class User{
    @PrimaryGeneratedColumn()
    userId : number;

    @Column({length : 50})
    name:string;

    @Column({length:50})
    email:string;

    @Column({length:100})
    password:string;

    @OneToMany(() => Like, (like) => like.user)
    likes:Like[]

    @OneToMany(() => Channel, (channel) => channel.users)
    channels:Channel[]
}