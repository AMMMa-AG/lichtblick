import { Component, ElementRef, Input, Renderer, ViewChild } from '@angular/core';
import { Range, Events } from 'ionic-angular';
import Plyr from 'plyr';
import { PlayerComponentBase } from '../player/player';
import * as $ from 'jquery';

@Component({
  selector: 'iframe-player',
  templateUrl: 'iframe-player.html'
})
export class IframePlayerComponent extends PlayerComponentBase {
  @Input() src: string;
  @ViewChild('video') private elementView: ElementRef;
  @ViewChild('slider') private slider: Range;

  private ready: boolean = false;
  protected playing: boolean = false;
  protected recording: boolean = false;
  private stopTime: number = 0;
  private updatingSlider: boolean = false;
  private plyr: any;

  constructor(
    public renderer: Renderer,
    public events: Events,
    public elRef: ElementRef
  ) {
    super(elRef);
  }

  get hasCapture() {
    return false;
  }

  getProviderByUrl(url) {
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)) {
        return 'youtube';
    }
    if (/^https?:\/\/player.vimeo.com\/video\/\d{0,9}(?=\b|\/)/.test(url)) {
        return 'vimeo';
    }
    return null;
  }

  ngAfterViewInit() {
    // configure Plyr's HTML element
    const elem: HTMLElement = this.elementView.nativeElement;
    elem.setAttribute('data-plyr-provider', this.getProviderByUrl(this.src));
    elem.setAttribute('data-plyr-embed-id', this.src);

    // create & configure Plyr instance
    this.plyr = new Plyr(this.elementView.nativeElement, {
      debug: false,
      controls: [],
      clickToPlay: false,
      storage: {
        enabled: false
      },
      iconUrl: 'assets/plyr/plyr.svg',
      blankVideo: 'assets/plyr/blank.mp4'
    });

    this.plyr.on('pause', () => {
      this.playing = false;
    });

    this.plyr.on('ready', () => {
      if (this.ready) {
        return;
      }
      this.plyr.pause();
      this.ready = true;
      this.events.publish("player:ready");
      this.plyr.on('timeupdate', () => {
        this.duration = this.plyr.duration;
        this.currentTime = this.plyr.currentTime;
        this.isFullscreen = this.plyr.fullscreen.active;
        this.events.publish('player:timeupdate',
          this.currentTime, this.playing);
        this.syncSlider();
        if (this.stopTime && this.stopTime <= this.plyr.currentTime) {
          this.stopTime = 0; // reset range
          this.pause();
          return;
        }
      });
      this.plyr.on('seeked', () => {
        this.currentTime = this.plyr.currentTime;
        this.events.publish('player:timeupdate',
          this.currentTime, this.playing);
        this.syncSlider();
      });

      let posterHidded = false;
      this.plyr.on('play', () => {
        // hide poster after the first play() because it doesn't pass any events to the
        // underlying iframe
        if (!posterHidded) {
          posterHidded = true;
          $('.plyr__poster').hide();
        }
      });
    });

    this.setupFloatingPlayer();
  }

  play(): Promise<any> {
    this.plyr.play();
    this.playing = true;
    this.events.publish("player:play");
    return Promise.resolve();
  }

  pause() {
    this.plyr.pause();
    this.playing = false;
    this.events.publish("player:pause");
  }

  playOrPause() {
    if (this.playing) {
      this.pause();
      return Promise.resolve();
    } else {
      return this.play();
    }
  }

  setRange(from, to) {
    this.seek(from);
    this.stopTime = from == to ? 0 : to;
    this.syncSlider();
  }

  seek(to) {
    this.plyr.currentTime = to;
  }

  record() {
    if (this.recording) {
      this.endTime = this.plyr.currentTime;
      this.recording = false;
      this.events.publish("player:endrecord");
      this.pause();
    } else {
      this.recording = true;
      this.startTime = this.plyr.currentTime;
      this.endTime = this.startTime;
      this.captureUrl = this.capture();
      this.play().then(() => {
        // function that resets the recording.
        // it's passed along to the "player:startrecord" event so consumer may
        // cancel the recording.
        const cancel = () => {
          this.pause();
          this.recording = false;
          this.currentTime = this.startTime;
        };
        this.events.publish("player:startrecord", cancel);
      });
    }
  }

  shoot() {
    this.startTime = this.endTime = this.plyr.currentTime;
    this.captureUrl = this.capture(100);
    this.events.publish("player:startrecord", () => { });
    this.events.publish("player:endrecord");
  }

  slide() {
    if (!this.updatingSlider) {
      this.plyr.currentTime = this.slider.value / 1000;
    }
  }

  syncSlider() {
    this.updatingSlider = true;
    this.slider.value = this.currentTime * 1000;
    setTimeout(() => this.updatingSlider = false);
  }

  capture(preferredWidth = 50) {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
  }

  toggleFullScreen() {
    this.plyr.fullscreen.toggle();
  }
}
