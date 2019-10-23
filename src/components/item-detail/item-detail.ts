import { Component, ViewChild } from '@angular/core';
import { ItemTextDetailComponent } from "../item-text-detail/item-text-detail";
import { ItemMarkersDetailComponent } from "../item-markers-detail/item-markers-detail";
import { ItemCanvasDetailComponent } from "../item-canvas-detail/item-canvas-detail";

@Component({
  selector: 'lichtblick-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailComponent {
  _visible: boolean;
  detailKind: string = 'textDetail';
  views: Map<string, any> = new Map();

  @ViewChild('textDetail') public textDetail: ItemTextDetailComponent;
  @ViewChild('markersDetail') public markersDetail: ItemMarkersDetailComponent;
  @ViewChild('canvasDetail') public canvasDetail: ItemCanvasDetailComponent;

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    if (value) {
      this.segmentChanged();
    } else {
      this.views.forEach(view => view.hide());
    }
  }

  constructor() {
  }

  ngOnInit() {
    this.views.set('textDetail', this.textDetail);
    this.views.set('markersDetail', this.markersDetail);
    this.views.set('canvasDetail', this.canvasDetail);
  }

  segmentChanged() {
    setTimeout(() => this.views.get(this.detailKind).show());
  }
}
