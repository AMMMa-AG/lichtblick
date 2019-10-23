import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Button, ViewController } from 'ionic-angular';
import { StateProvider } from '../../providers/state/state';
import Clipboard from 'clipboard';
import QRCode from 'qrcode';

@IonicPage()
@Component({
  selector: 'share-page',
  templateUrl: 'share.html',
})
export class SharePage {
  @ViewChild('copyButton') private copyButton: Button;

  link: string;
  qrUrl: string;
  pending: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public state: StateProvider
  ) {
  }

  createLink() {
    this.pending = true;
    this.state.share().then((id) => {
      if (!id) return;

      this.pending = false;
      const url = this.state.baseUrl + '?' + "id=" + encodeURI(id);
      this.link = url;

      QRCode.toDataURL(url, (err, dataUrl) => {
        if (!err) this.qrUrl = dataUrl;
      });

      setTimeout(() => {
        new Clipboard(this.copyButton.getNativeElement(), {
          text() {
            return url;
          }
        })
      }, 10);
    });
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
