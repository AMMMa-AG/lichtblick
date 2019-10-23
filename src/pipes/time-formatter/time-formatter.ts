import { Pipe, PipeTransform } from '@angular/core';
import Shapes from '../../lib/shapes';

@Pipe({
  name: 'timeFormatter',
})
export class TimeFormatterPipe implements PipeTransform {
  transform(value: string) {
    return Shapes.Classes.Utils.toHHMMSS(parseFloat(value), false);
  }
}
