import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';


@Module({
  providers: [ CloudinaryProvider,CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
