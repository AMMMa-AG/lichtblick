import { Component } from '@angular/core';
import { NavController, ModalController, Events, reorderArray } from "ionic-angular";
import { VisualMarkerProvider } from "../../providers/visual-marker/visual-marker";

@Component({
  selector: 'item-markers-detail',
  templateUrl: 'item-markers-detail.html'
})
export class ItemMarkersDetailComponent {
  markers: string[] = [];

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public vmProvider: VisualMarkerProvider, public events: Events) {
  }

  show() {
  }

  hide() {
  }

  ngOnInit() {
    this.events.subscribe('markers:closed', (markers) => {
      this.markers = markers;
      this.detailChanged();
    });
  }

  detailChanged() {
    this.events.publish('itemdetail:changed');
  }

  addMarker() {
    this.navCtrl.push('VisualPage', {markers: this.markers});
  }

  removeMarker(slidingItem, id) {
    slidingItem.close();
    this.markers = this.markers.filter(item => item != id);
    this.detailChanged();
  }

  reorderItems(indexes) {
    this.markers = reorderArray(this.markers, indexes);
    this.detailChanged();
  }

  showLex(vm) {
    this.modalCtrl.create('LexPage', {
      fileName: this.vmProvider.resolveMarker(vm).fileName
    }).present();
  }
}
