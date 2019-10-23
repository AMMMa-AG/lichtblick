import { SharedModule } from './../../app/shared.module';
import { MainPage } from './main';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    MainPage,
  ],
  imports: [
    IonicPageModule.forChild(MainPage),
    SharedModule
  ],
  exports: [
    MainPage
  ]
})

export class MainPageModule { }
