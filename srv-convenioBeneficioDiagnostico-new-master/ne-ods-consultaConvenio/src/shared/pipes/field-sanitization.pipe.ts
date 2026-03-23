import { Injectable, type PipeTransform } from '@nestjs/common';
import { SanitizationPipe } from './sanitization.pipe';

@Injectable()
export class FieldSanitizationPipe implements PipeTransform {
    private readonly sanitizationPipe = new SanitizationPipe();

    transform(value: unknown) {
        return this.sanitizationPipe.transform(value);
    }
}
