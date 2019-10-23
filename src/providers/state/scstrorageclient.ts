import { Injectable } from '@angular/core';

@Injectable()
export class SchulCloudStorageClient {

  constructor() {
  }

  save(data) {
    console.log("save", data);
    window.postMessage({
      action: 'saveState',
      data: data
    }, '*');
    return Promise.resolve(data);
  }

  load(id) {
    console.log("load", id);
    return new Promise((resolve) => {

      const handler = (e) => {
        if (e.data.action === 'init') {
          resolve(e.data.data);
        }
        window.removeEventListener('message', handler);
      };

      window.addEventListener('message', handler);
      window.postMessage({
        action: 'getState',
      }, '*');
    });
  }

  blobSet(dataUrl) {
    return Promise.resolve(dataUrl);
  }

  blobGetUri(id) {
    return id;
  }
}
