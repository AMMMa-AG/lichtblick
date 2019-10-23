import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { Content, Events, IonicPage, NavController, ModalController, PopoverController } from 'ionic-angular';
import { StateProvider } from '../../providers/state/state';
import { VisualMarkerProvider } from '../../providers/visual-marker/visual-marker';
import { Item, SegmentItem } from '../../providers/state/item';
import { PlayerComponent } from "../../components/player/player";
import { ItemDetailComponent } from "../../components/item-detail/item-detail";

@IonicPage()
@Component({
  selector: 'main-page',
  templateUrl: 'main.html'
})
export class MainPage implements OnInit {
  @ViewChild('content') content: Content;
  @ViewChild('player') private player: PlayerComponent;
  @ViewChild('itemDetail') private itemDetail: ItemDetailComponent;

  selectedItem: SegmentItem;
  recordedItem: SegmentItem;
  provider: string;
  title: string;
  videoSrc: string;
  innerWidth: any;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public popCtrl: PopoverController,
    public state: StateProvider,
    public events: Events,
    public vmProvider: VisualMarkerProvider
  ) {
    this.provider = this.state.videoSrc.endsWith('.mp4') ? 'html5' : 'iframe';
  }

  ngOnInit() {
    this.title = this.state.title;
    this.videoSrc = this.state.videoSrc;
    this.innerWidth = window.innerWidth;
    this.sendFrameResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.sendFrameResize();
  }

  sendFrameResize() {
      if (window.parent) {
        var data = {
          action: 'resize',
          height: this.innerWidth
        }
        // we might need to serialze this obj for IE
        window.parent.postMessage(data, '*');
      }
    } catch (error) {
      //
    }
  }
  ngAfterViewInit() {
    this.events.subscribe('player:startrecord', (cancel) => {
      this.recordedItem = null;

      let item = <SegmentItem>{
        captureUrl: this.player.captureUrl,
        startTime: this.player.startTime,
        endTime: this.player.endTime
      };

      this.state.findByTimeRange(item).then(res => {
        if (res) {
          // cancel if've found a duplicate (by time range)
          cancel();
        } else {
          this.state.addItem(item).then((items: any) => {
            this.recordedItem = items[items.length - 1];
          });
        }
      });
    });

    this.events.subscribe('player:endrecord', () => {
      if (this.recordedItem) {
        this.recordedItem.endTime = this.player.endTime;
        this.state.updateItem(this.recordedItem);
      }
    });

    this.events.subscribe('items:select', (item, pause) => this.onSelect(item, pause));
    this.events.subscribe('itemdetail:changed', () => this.onDetailChanged());
    this.events.subscribe('items:selectimage', (item, event) => this.onSelectImage(item, event));
    this.events.subscribe('items:insert', (afterItem, event) => this.onInsertItem(afterItem, event));
  }

  clear() {
    this.state.clear();
  }

  onSelect(item, pause) {
    if (item) {
      this.itemDetail.visible = true;

      this.itemDetail.textDetail.title = item.title || '';
      this.itemDetail.textDetail.text = item.text || '';
      this.itemDetail.markersDetail.markers = item.markers || [];
      this.itemDetail.canvasDetail.player = this.player;
      this.itemDetail.canvasDetail.load(item.uid);

      this.selectedItem = item;

      if (this.state.isSegmentItem(item)) {
        if (pause) {
          this.player.setRange(item.startTime, item.endTime);
          this.player.pause();
        }
      }

      this.content.scrollToTop();

    } else {
      this.itemDetail.visible = false;
      this.selectedItem = null;
    }
  }

  onDetailChanged() {
    this.selectedItem.title = this.itemDetail.textDetail.title;
    this.selectedItem.text = this.itemDetail.textDetail.text;
    this.selectedItem.markers = this.itemDetail.markersDetail.markers;
    this.selectedItem.visualAnnotations = this.itemDetail.canvasDetail.shapesCount;
    this.state.updateItem(this.selectedItem);
  }

  onSelectImage(item, event) {
    if (!this.selectedItem) return;

    const list = this.itemDetail.canvasDetail.getDraggables()
      .filter(item => item.src)
      .map(item => item.src);

    if (list.length) {
      const popover = this.popCtrl.create('ImageListPage', {
        urls: list
      });
      popover.onDidDismiss(data => {
        if (data) {
          this.selectedItem.captureUrl = data.url;
          this.state.updateItem(this.selectedItem);
        }
      });
      popover.present({
        ev: event
      })
    }
  }

  openShare() {
    this.modalCtrl.create('SharePage').present();
  }

  openPreview() {
    this.navCtrl.push('PreviewPage');
  }

  onInsertItem(afterItem, event) {
    if (!this.selectedItem) return;

    let newItem = <Item>{
      title: 'Titel',
    };

    this.state.insertItem(newItem, afterItem);
  }
}
