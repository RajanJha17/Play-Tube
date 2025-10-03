import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './utils/common.module';
import { AppLoggerMiddleware, HttpRequestHeadersMiddleware } from './middlewares';
import { MailerModule } from '@nestjs-modules/mailer';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRoot(process.env.DATABASE_URL!),
    CloudinaryModule,
    AuthModule,
    CommonModule,
    MailerModule.forRoot({
      transport: `smtp://${process.env.EMAIL_ADDRESS}:${process.env.EMAIL_PASSWORD}@${process.env.EMAIL_HOST}`,
      defaults:{
        from: `"No Reply" <${process.env.EMAIL_ADDRESS}>`,
        tls:{
          rejectUnauthorized:false
        },
        secure:true
      }
    }),
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpRequestHeadersMiddleware).forRoutes("*");
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
