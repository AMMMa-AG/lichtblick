import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LexPage } from './lex';
import { SharedModule } from "../../app/shared.module";

@NgModule({
  declarations: [
    LexPage,
  ],
  imports: [
    IonicPageModule.forChild(LexPage),
    SharedModule
  ],
})
export class LexPageModule {}
