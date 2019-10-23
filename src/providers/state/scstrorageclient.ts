import { Injectable } from '@angular/core';

@Injectable()
export class SchulCloudStorageClient {
  id: string;

  constructor() {
  }

  save(data) {
    // console.log("save", data);
    window.parent.postMessage({
      action: 'saveState',
      data: data,
      id: this.id
    }, '*');
    return Promise.resolve(data);
  }

  load(id) {
    // console.log("load", id);
    this.id = id;
    window.addEventListener('message', function (e) { console.log(e)});
    return new Promise((resolve) => {
      console.log("initPromise");
      const handler = (e) => {
        console.log("init", e.data.action);
        if (e.data.action === 'init') {
          console.log("resolve");
          console.log(e.data.data);
          resolve(e.data.data);
        }
        window.removeEventListener('message', handler);
      };

      window.addEventListener('message', handler);
      window.parent.postMessage({
        action: 'getState',
        id: id,
      }, '*');
    });
  }

  blobSet(dataUrl) {
    console.log("blobset", dataUrl);
    return Promise.resolve(dataUrl);
  }

  blobGetUri(id) {
    return id;
  }
}
