import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));       
  app.setBaseViewsDir(join(__dirname, '..', 'views'));        // шаблоны
  app.setViewEngine('hbs');                                   // движок
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  hbs.registerHelper('eq', (a : any, b : any) => a === b);               // для подсветки вкладок

  await app.listen(3000);
}
bootstrap();