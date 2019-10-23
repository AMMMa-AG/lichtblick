import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'image-list-page',
  templateUrl: 'image-list.html',
})
export class ImageListPage {
  urls: string[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.urls = this.navParams.get('urls') || [];
  }

  ionViewDidLoad() {
  }

  select(url) {
    this.viewCtrl.dismiss({
      url
    })
  }

}
