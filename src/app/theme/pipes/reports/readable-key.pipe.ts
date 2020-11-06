import { Pipe, PipeTransform } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

@Pipe({
  name: 'readableKey'
})
export class ReadableKeyPipe implements PipeTransform {

  constructor(private titleCase: TitleCasePipe) {

  }
  transform(value: any): any {
    if (value) {
      return this.titleCase.transform(value.replace(/_/gm, ` `));
    }
    return null;
  }

}
