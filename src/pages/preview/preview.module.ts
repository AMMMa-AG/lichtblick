import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreviewPage } from './preview';
import { SharedModule } from "../../app/shared.module";

@NgModule({
  declarations: [
    PreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(PreviewPage),
    SharedModule
  ],
})
export class PreviewPageModule {}
