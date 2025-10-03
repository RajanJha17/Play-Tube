import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  console.log("env",process.env.JWT_SECRET)
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
