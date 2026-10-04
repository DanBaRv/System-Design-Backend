import { Injectable } from '@nestjs/common'
import * as Minio from 'minio'
import { randomBytes } from 'crypto'

@Injectable()
export class FilesService {
    private minioClient: Minio.Client

    constructor() {
        this.minioClient = new Minio.Client({
            endPoint: 'localhost',
            port: 9000,
            useSSL: false,
            accessKey: 'root',
            secretKey: 'rootpassword',
        })
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const ext = this.safeExtension(file.originalname)//расширение
        const fileName = `${randomBytes(8).toString('hex')}${ext}`//новое имя файла

        await this.minioClient.putObject(//кладем полученный файл в бакет
            'posttrace',  //бакет куда кладем    
            fileName, //файл внутри бакета, под каким именем мы сохраним 
            file.buffer,//данные файла, что кладем файл уже в буфере
            file.size,//размер файла
            { 'Content-Type': file.mimetype }//метаданные
        )

        return fileName//вернули новое имя файла
    }

    private safeExtension(originalName: string): string {//расширения
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.mp4']
        const dot = originalName.lastIndexOf('.')
        if (dot === -1) return ''
        const ext = originalName.slice(dot).toLowerCase()
        return allowed.includes(ext) ? ext : ''
    }
}