import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'swapKeyValueJson'
})
export class SwapKeyValueJsonPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const updatedValue = {};
    Object.keys(value).map((key: string) => {
      updatedValue[value[key]] = key;
      // delete value[key];
    });
    // console.log({ value });
    return updatedValue;
  }

}
