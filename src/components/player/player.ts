import * as $ from 'jquery';
import { ElementRef } from '@angular/core';

/*
 * Represents the interface all player components must implement.
 */
export interface PlayerComponent {
  captureUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  currentTime: number;
  hasCapture: boolean;
  isFullscreen: boolean;
  isFloating: boolean;

  play(): Promise<any>;
  playOrPause(): Promise<any>;
  pause();
  setRange(from: number, to: number);
  seek(to: number);
  record();
  shoot();
  capture(preferredWidth?: number, contentType?: string, quality?: number);
  toggleFullScreen();
}

/*
 * Abstract base class for player components.
 */
export abstract class PlayerComponentBase implements PlayerComponent {
  captureUrl: string;
  startTime: number = -1;
  endTime: number = -1;
  duration: number = 0;
  currentTime: number = 0;
  hasCapture: boolean;
  isFullscreen: boolean;

  private preventFloating: boolean;
  private scrolledElement: any;

  constructor(public elRef: ElementRef) {
  }

  abstract play(): Promise<any>;
  abstract playOrPause(): Promise<any>;
  abstract pause();
  abstract setRange(from: number, to: number);
  abstract seek(to: number);
  abstract record();
  abstract shoot();
  abstract capture(preferredWidth?: number, contentType?: string, quality?: number);
  abstract toggleFullScreen();

  get isFloating(): boolean {
    return $(this.elRef.nativeElement).hasClass('floating-player');
  }

  setupFloatingPlayer() {
    // FIXME: disabled
    // this.setupFloatingPlayerImpl();
  }

  setupFloatingPlayerImpl() {
    let offset = 0;
    let elem = $(this.elRef.nativeElement);
    let scrollParent = this.scrolledElement = elem.parents('div.scroll-content');
    let placeholder;

    const isFloating = () => elem.hasClass('floating-player');

    $(window).on('resize', () => {
      if (!isFloating()) {
        let top = elem.offset().top;
        offset = Math.floor(top + elem.outerHeight() / 1.7);
      }
    });
    $(window).triggerHandler('resize');

    scrollParent.on('scroll', () => {
      const scrollTop = scrollParent.scrollTop();
      if (scrollTop < 20) {
        this.preventFloating = false;
      }
      if (!(isFloating() || this.preventFloating)) {
        if (scrollTop > offset) {
          console.log && console.log("not floating -> floating", scrollTop);
          placeholder = $('<div>');
          placeholder.height(elem.outerHeight());
          placeholder.width(elem.outerWidth());
          placeholder.insertAfter(elem);
          elem.addClass("floating-player");
          $("ion-app").append(elem);
        }
      } else {
        if (scrollTop <= offset || this.preventFloating) {
          console.log && console.log("floating -> not floating", scrollTop);
          if (placeholder) {
            elem.insertAfter(placeholder);
            placeholder.remove();
            placeholder = null;
          }
          elem.removeClass("floating-player");
        }
      }
    });
  }

  cancelFloating() {
    if (this.isFloating && this.scrolledElement) {
      this.preventFloating = true;
      this.scrolledElement.triggerHandler('scroll');
    }
  }
}
