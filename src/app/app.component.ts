import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = 'MainPage';

  constructor(platform: Platform) {
    platform.ready().then(() => {
    });
  }
}
