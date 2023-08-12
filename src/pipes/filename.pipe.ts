import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

/** Fixes filenames */
@Injectable()
class FilenamePipe implements PipeTransform {
    transform(value: Express.Multer.File[] | Express.Multer.File, metadata: ArgumentMetadata): any {
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(e => e.originalname = Buffer.from(e.originalname, 'latin1').toString('utf8'));
            } else {
                value.originalname = Buffer.from(value.originalname, 'latin1').toString('utf8');
            }
        }
        return value;
    }
}

export default FilenamePipe;