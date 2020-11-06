import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dbDate'
})
export class DbDatePipe implements PipeTransform {

  transform(value: Date, args?: any): any {
    if (args === 'Y-m-d') {
      return value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + (value.getDate())).slice(-2);
    }
    return value;
  }

}
