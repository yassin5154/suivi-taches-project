import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 30): string {
    return value && value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
