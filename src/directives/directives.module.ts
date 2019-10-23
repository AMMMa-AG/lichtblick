import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { Autosize } from './autosize/autosize';
import { SelectAll } from './select-all/select-all';

@NgModule({
  declarations: [
    Autosize,
    SelectAll
  ],
  imports: [IonicModule],
  exports: [
    Autosize,
    SelectAll
  ]
})
export class DirectivesModule { }
