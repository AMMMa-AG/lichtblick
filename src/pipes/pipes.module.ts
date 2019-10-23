import { NgModule } from '@angular/core';
import { TimeFormatterPipe } from './time-formatter/time-formatter';
@NgModule({
	declarations: [TimeFormatterPipe],
	imports: [],
	exports: [TimeFormatterPipe]
})
export class PipesModule {}
