import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class CloudinaryService {

    async uploadFile(file: Express.Multer.File) : Promise<UploadApiResponse | UploadApiErrorResponse>{
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder:"play-tube",
                resource_type:"auto"
            },
            (error, result) => {
                if(error) return reject(error);
                resolve(result!);
            }).end(file.buffer);
        });
    }

}
