import { ElementRef, Directive, OnInit } from '@angular/core';

@Directive({
  selector: 'ion-textarea[autosize]',
  host: {
    '(ionChange)': 'adjust()'
  }
})

export class Autosize implements OnInit {
  constructor(private element: ElementRef) {
  }

  ngOnInit(): void {
    setTimeout(() => this.adjust(), 0);
  }

  adjust(): void {
    const textArea: HTMLElement = this.element.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    if (textArea.scrollHeight) {
      textArea.style.height = textArea.scrollHeight + 'px';
    } else {
      setTimeout(() => this.adjust(), 200);
    }
  }
}
