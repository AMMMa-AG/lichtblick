import { Component } from '@angular/core';
import { Events } from "ionic-angular";

@Component({
  selector: 'item-text-detail',
  templateUrl: 'item-text-detail.html'
})
export class ItemTextDetailComponent {
  title: string;
  text: string;

  constructor(public events: Events) {
  }

  show() {
  }

  hide() {
  }

  detailChanged() {
    this.events.publish('itemdetail:changed');
  }
}
