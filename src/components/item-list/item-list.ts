import { Component, OnInit } from '@angular/core';
import { StateProvider } from "../../providers/state/state";
import { Events } from "ionic-angular";
import { VisualMarkerProvider } from "../../providers/visual-marker/visual-marker";

@Component({
  selector: 'lichtblick-item-list',
  templateUrl: 'item-list.html'
})
export class ItemListComponent implements OnInit {
  items: any[];
  selectedIndex = -1;

  constructor(public state: StateProvider, public vmProvider: VisualMarkerProvider, public events: Events) {
  }

  ngOnInit() {
    this.events.subscribe('items:update', (items) => this.items = items);
    this.events.subscribe('player:timeupdate', (time, playing) => {
      if (!playing) return;
      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i];
        if (Math.abs(time - item.startTime) < 0.2) {
          this.select(item, i, false);
          return;
        }
      }
    });
    this.state.getItems();
  }

  deleteItem(slidingItem, index) {
    this.select(null, -1);
    slidingItem.close();
    return this.state.deleteItem(index);
  }

  reorderItems(indexes) {
    return this.state.reorderItems(indexes);
  }

  select(item, index, pause = true) {
    this.events.publish('items:select', item, pause);
    this.selectedIndex = index;
  }

  selectImage(event: Event, item, index) {
    event.preventDefault();
    event.stopPropagation();

    // only fire 'items:selectimage' when the current item is already selected.
    if (index == this.selectedIndex) {
      this.events.publish('items:selectimage', this.items[index], event);
    } else {
      this.select(item, index);
    }
  }

  insertItem(event, afterItem, index) {
    this.select(afterItem, index);
    this.events.publish('items:insert', afterItem, event);
  }
}
