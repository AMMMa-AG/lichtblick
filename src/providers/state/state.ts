import { Injectable } from '@angular/core';
import { Events, reorderArray } from 'ionic-angular';
import { Item, SegmentItem } from './item';
import uuid from 'uuid/v4';
import { URLSearchParams } from "@angular/http";
import md5 from 'js-md5';
import Shapes from '../../lib/shapes';
import { VisualMarkerProvider } from '../visual-marker/visual-marker';

declare const process: any;
declare const nw: any;

@Injectable()
export class StateProvider {
  videoSrc: string;
  title: string;
  storage: any;
  sessionServer: any;
  pending: boolean;
  prefix: string;
  hasSharing: boolean;
  DEBUG: boolean;
  RELEASE: boolean;
  whiteLabel: boolean;
  nwjs: any;
  categories: number[];

  constructor(
    private events: Events,
    private vmProvider: VisualMarkerProvider
  ) {
    // build configuration
    let params = new URLSearchParams(window.location.search.substr(1));
    if (process.env.DISABLE_SHARING) {
      this.hasSharing = !process.env.DISABLE_SHARING;
    } else { 
      this.hasSharing = !(params.get('disableSharing') === '1');
    }
    this.whiteLabel = process.env.WHITE_LABEL;
    this.DEBUG = process.env.DEBUG;
    this.RELEASE = process.env.RELEASE;
    this.nwjs = typeof nw !== "undefined" ? nw : null;

    this.videoSrc = decodeURIComponent(params.get('src') || '');
    this.title = decodeURIComponent(params.get('title') || 'Lichtblick');

    // build storage prefix from the MD5 of the video
    this.prefix = 'p' + md5(this.videoSrc);
    this.storage = new Shapes.Classes.Storage(this.prefix);

    // configure shapes
    Shapes.Factory.configure({
      storagePrefix: this.prefix,
      ...(this.DEBUG && {sessionServerUrl: 'http://localhost:3090'})
    });

    // get a session server instance
    this.sessionServer = Shapes.Factory.createSessionServer();

    // do we have a session id?
    let sessionId = params.get('id');
    if (sessionId) {
      this.pending = true;
      this.sessionServer.load(sessionId).then((res) => {
        // import session data and redirect with new video & title
        let data = this.import(res.data);
        this.redirect([
          { name: 'src', value: data.videoSrc },
          { name: 'title', value: data.title },
          { name: 'cat', value: data.categories }
        ]);
        // not reached due to the redirect above
      }).catch(() => {
        this.pending = false;
      });
    } else {
      // no video -> redirect to chooser
      if (!this.videoSrc) {
        if (this.isShell) {
          location.replace(this.baseUrl + '#offline-chooser');
        } else {
          location.replace(this.baseUrl + '#chooser');
        }
      }
    }

    this.categories = params.getAll('cat').map(item => parseInt(item));
    this.vmProvider.filter(this.categories);

    this.initDragDrop();
  }

  get isShell(): boolean {
    return !!this.nwjs || /Electron/.test(navigator.userAgent);
  }

  getItems(): Promise<Item[]> {
    return new Promise((resolve) => {
      let res = this.storage.load('items', []);
      let typedItems = res.map((item, index) => {
        return { ...item, index };
      });
      this.events.publish('items:update', typedItems);
      resolve(typedItems);
    });
  }

  setItems(items): Promise<Item[]> {
    let promises = Promise.resolve();

    // store video capture data URL on the session server
    if (this.hasSharing) {
      items
        .filter(i => i.captureUrl && i.captureUrl.startsWith('data:'))
        .forEach(i => {
          promises = promises.then(() => {
            return this.sessionServer.blobSet(i.captureUrl)
              .then(url => {
                i.captureUrl = url;
              })
              .catch(() => Promise.resolve());
          })
        });
    }

    return promises.then(() => {
      this.storage.store('items', items);
      return Promise.resolve(items);
    });
  }

  addItem(item) {
    return this.getItems().then(items => {
      // generate a unique id for the item. use a UUID and strip its '-'
      // to make it slightly shorter.
      item.uid = uuid().replace(/-/g, '');
      items.push(item);
      return this.setItems(items).then(() => this.getItems());
    });
  }

  insertItem(item, afterItem) {
    item.uid = uuid().replace(/-/g, '');

    return this.getItems().then(items => {
      var afterItemIndex = items.findIndex(i => {
        return i.uid == afterItem.uid
      });
      if (afterItemIndex >= 0) {
        items.splice(afterItemIndex + 1, 0, item);
      }
      return this.setItems(items).then(() => this.getItems());
    });
  }

  updateItem(item) {
    return this.getItems().then(items => {
      let typedItems = items.map(i => {
        if (item.uid == i.uid)
          return item;
        else
          return i;
      });
      return this.setItems(typedItems).then(() => this.getItems());
    });
  }

  deleteItem(index) {
    return this.getItems().then(items => {
      items.splice(index, 1);
      return this.setItems(items).then(() => this.getItems());
    });
  }

  reorderItems(indexes) {
    return this.getItems().then(items => {
      items = reorderArray(items, indexes);
      return this.setItems(items).then(() => this.getItems());
    });
  }

  findByTimeRange(item: SegmentItem) {
    return this.getItems().then(items => {
      return items.find((i: SegmentItem) => {
        return item.startTime == i.startTime && item.endTime == i.endTime;
      });
    });
  }

  isSegmentItem(item) {
    return item.startTime !== undefined;
  }

  clear() {
    this.storage.clear('');
    return this.getItems();
  }

  /**
   * Gets the URL of the app w/out any params.
   */
  get baseUrl(): string {
    return location.href.split(/[?#]/)[0];
  }

  /**
   * Creates a URL of the app for the specified parameters.
   *
   * @param {any[]} params
   * @returns {String}
   */
  makeRedirectUrl(params: any[] = []) {
    // get the URL of the app w/out any params
    const keyValues = params
      .filter(item => item.name)
      .map(item => {
        if (Array.isArray(item.value)) {
          return item.value.map(value => {
            return item.name + '=' + encodeURIComponent(value);
          }).join('&');
        } else {
          return item.name + '=' + encodeURIComponent(item.value);
        }
      });
    const keyValuesString = keyValues.join('&');
    return keyValuesString ? this.baseUrl + '?' + keyValuesString : this.baseUrl;
  }

  /**
   * Redirects to the app URL specified by the given parameters.
   *
   * @param {any[]} params
   */
  redirect(params: any[] = []) {
    location.replace(this.makeRedirectUrl(params));
  }

  /**
   * Imports storage data from the specified plain object.
   *
   * @param {Object} data
   * @returns {Object} plain object with storage data.
   */
  import(data) {
    // set defaults
    data = Object.assign({}, {
      videoSrc: 'assets/video/test.mp4',
      title: 'Lichtblick',
      categories: []
    }, data);
    Shapes.Classes.Storage.importAll(data);
    return data;
  }

  /**
   * Exports all storage data stored under our prefix.
   *
   * @returns {Object} plain object with storage data.
   */
  export() {
    let data = Shapes.Classes.Storage.exportAll(this.prefix);
    data.title = this.title;
    data.videoSrc = this.videoSrc;
    data.categories = this.categories;
    return data;
  }

  /**
   * Shares all storage data stored under our prefix with the sessions server.
   *
   * @returns {Promise} whose result is the session server's storage ID or null,
   * when something went wrong.
   */
  share() {
    if (!this.hasSharing)
      return Promise.resolve(null);

    return this.sessionServer.save(this.export())
      .then(res => res.id)
      .catch(() => null);
  }

  /**
   * Initializes and handles drag&drop when running under Electron.
   */
  initDragDrop() {
    if (!/Electron/.test(navigator.userAgent)) return;

    document.ondragover = () => false;
    document.ondragleave = () => false;
    document.ondragend = () => false;

    document.ondrop = (e) => {
      e.preventDefault();
      let files = e.dataTransfer ? e.dataTransfer.files : null;
      if (files && files.length) {
        let file = files[0];
        if (file.type && file.type.startsWith('video/')) {
          let path = file["path"];
          if (path) {
            path = 'file:///' + path.replace(/\\/g, '/');
            this.redirect([
              { name: 'src', value: path },
              { name: 'title', value: file.name }
            ]);
          }
        }
      }
      return false;
    };
  }
}
