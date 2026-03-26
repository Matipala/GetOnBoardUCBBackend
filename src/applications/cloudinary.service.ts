import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'getonboard_cvs',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (result) return resolve(result);
          reject(
            new Error('Error desconocido al subir el archivo a Cloudinary'),
          );
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
