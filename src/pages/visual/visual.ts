import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { VisualMarkerProvider, MarkerNode } from "../../providers/visual-marker/visual-marker";

@IonicPage()
@Component({
  selector: 'visual-page',
  templateUrl: 'visual.html',
})
export class VisualPage {
  isRoot: boolean;
  root: MarkerNode;
  markers: string[];

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public vmProvider: VisualMarkerProvider,
    public events: Events
  ) {
    let node = navParams.get('node');
    this.isRoot = !node;
    this.root = node || vmProvider.getEditDataSource().root;
    this.markers = navParams.get('markers') || [];
    if (this.isRoot) {
      this.markers.forEach(id => this.root.dataSource.getById(id)["checked"] = true);
    }
  }

  selectNode(node) {
    this.navCtrl.push(VisualPage, { node, markers: this.markers });
  }

  selectEntry(entry) {
    entry.checked = !entry.checked;
  }

  resolveImage(entry) {
    return this.vmProvider.resolveEntryImage(entry);
  }

  close() {
    this.navCtrl.popToRoot();
  }

  ionViewDidLeave() {
  }

  ionViewWillUnload() {
    if (this.isRoot) {
      this.markers = this.root.dataSource.allEntries
        .filter(entry => entry["checked"])
        .map(entry => entry.image);
      this.events.publish('markers:closed', this.markers);
    }
  }

  showLex(entry) {
    this.modalCtrl.create('LexPage', {
      fileName: entry.fileName
    }).present();
  }
}
