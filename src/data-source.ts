import { DataSource } from 'typeorm'
import { Channel } from './channels/serviceChannel.entity'
import { User } from './channels/userChannel.entity'
import { Like } from './channels/likeChannel.entity'

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'posttrace',
  password: 'posttrace',
  database: 'posttrace',
  entities: [Channel, User, Like],        
  migrations: ['src/migrations/*.ts'],
})