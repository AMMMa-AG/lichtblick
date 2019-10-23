import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisualPage } from './visual';
import { SharedModule } from "../../app/shared.module";

@NgModule({
  declarations: [
    VisualPage,
  ],
  imports: [
    IonicPageModule.forChild(VisualPage),
    SharedModule
  ],
})
export class VisualPageModule {}
