import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { AccordionListComponent } from './accordion-list/accordion-list';
import { Html5PlayerComponent } from './html5-player/html5-player';
import { IframePlayerComponent } from './iframe-player/iframe-player';
import { ItemListComponent } from './item-list/item-list';
import { ItemDetailComponent } from './item-detail/item-detail';
import { PipesModule } from '../pipes/pipes.module';
import { ItemTextDetailComponent } from './item-text-detail/item-text-detail';
import { ItemCanvasDetailComponent } from './item-canvas-detail/item-canvas-detail';
import { ItemMarkersDetailComponent } from './item-markers-detail/item-markers-detail';

@NgModule({
  declarations: [
    AccordionListComponent,
    Html5PlayerComponent,
    IframePlayerComponent,
    ItemListComponent,
    ItemDetailComponent,
    ItemTextDetailComponent,
    ItemCanvasDetailComponent,
    ItemMarkersDetailComponent],
  imports: [IonicModule, PipesModule],
  exports: [
    AccordionListComponent,
    Html5PlayerComponent,
    IframePlayerComponent,
    ItemListComponent,
    ItemDetailComponent,
    ItemTextDetailComponent,
    ItemCanvasDetailComponent,
    ItemMarkersDetailComponent]
})
export class ComponentsModule { }
