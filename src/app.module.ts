import { Module } from '@nestjs/common';
import { ChannelsModule } from './channels/channels.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ChannelsModule,
    TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',     
  port: 5433,          
  username: 'posttrace',
  password: 'posttrace',
  database: 'posttrace',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],  
  synchronize: false,      
})
  ],
  
})

export class AppModule {}
