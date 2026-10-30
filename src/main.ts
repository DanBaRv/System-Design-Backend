import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { RedisStore } from 'connect-redis'
import { createClient } from 'redis'
import session from 'express-session'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));       
  app.setBaseViewsDir(join(__dirname, '..', 'views'));        // шаблоны
  app.setViewEngine('hbs');                                   // движок
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  hbs.registerHelper('eq', (a : any, b : any) => a === b);               // для подсветки вкладок
  hbs.registerHelper('fileUrl', (name: any) => {
    if (!name) return '/assets/default_cover.jpg'
    if (String(name).startsWith('default_')) return `/assets/${name}`
    return `http://localhost:9000/posttrace/${name}`
  })
  
  
  const redisClient = createClient({ url: 'redis://localhost:6379' })   
  await redisClient.connect()

  //мидлвар- вызывается сам всегда
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: 'posttrace-secret-key-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      },
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PostTrace API')                        // название
    .setDescription('Веб-сервис истории пересылки постов в каналах')  
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(3000)

}
bootstrap();