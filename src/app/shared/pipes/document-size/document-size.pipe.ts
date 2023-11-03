import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'documentSize' })

export class DocumentSizePipe implements PipeTransform {
  transform(sizeInBytes: number): string {
    if (sizeInBytes === 0 || typeof sizeInBytes !== 'number') return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const digitGroups = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    return parseFloat((sizeInBytes / Math.pow(1024, digitGroups)).toFixed(2)) + ' ' + units[digitGroups];
  }
}
