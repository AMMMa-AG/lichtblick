import { SharedModule } from './../../app/shared.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OfflineChooserPage } from './offline-chooser';

@NgModule({
  declarations: [
    OfflineChooserPage,
  ],
  imports: [
    IonicPageModule.forChild(OfflineChooserPage),
    SharedModule
  ],
})
export class OfflineChooserPageModule {}
