import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'ion-searchbar[select-all],ion-input[select-all]'
})
export class SelectAll {
  constructor(private elem: ElementRef) {
  }

  @HostListener('click')
  selectAll() {
    let nativeElem: HTMLInputElement = this.elem.nativeElement.querySelector('input');
    if (nativeElem) {
      if (nativeElem.setSelectionRange) {
        nativeElem.setSelectionRange(0, nativeElem.value.length);
      } else {
        nativeElem.select();
      }
    }
  }
}
