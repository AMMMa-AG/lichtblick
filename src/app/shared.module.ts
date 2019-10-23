import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { DirectivesModule } from '../directives/directives.module';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    IonicModule,
    DirectivesModule,
    ComponentsModule,
    PipesModule
  ],
  exports: [
    DirectivesModule,
    ComponentsModule,
    PipesModule
  ]
})
export class SharedModule { }
