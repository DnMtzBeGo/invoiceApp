import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileExtension' })
export class FileExtensionPipe implements PipeTransform {
  transform(filename: string | null, use = '/', defaultName = ''): string {
    // Verificar que filename sea una cadena no vacía
    if (!filename || typeof filename !== 'string') {
      return defaultName;
    }

    return filename.split(use).pop()?.toLocaleUpperCase() || '';
  }
}
