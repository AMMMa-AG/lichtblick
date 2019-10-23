import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-offline-chooser',
  templateUrl: 'offline-chooser.html',
})
export class OfflineChooserPage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
}
