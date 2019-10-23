import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';

import { MyApp } from './app.component';
import { SharedModule } from './shared.module';
import { StateProvider } from '../providers/state/state';
import { VisualMarkerProvider } from '../providers/visual-marker/visual-marker';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      mode: "ios",
      backButtonText: 'Zurück'
    }),
    IonicStorageModule.forRoot(),
    SharedModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    StateProvider,
    VisualMarkerProvider
  ]
})
export class AppModule { }
