import { Component, ElementRef, Input, Renderer, ViewChild } from '@angular/core';
import { Range, Events } from 'ionic-angular';
import Shapes from '../../lib/shapes';
import { PlayerComponentBase } from '../player/player';

@Component({
  selector: 'html5-player',
  templateUrl: 'html5-player.html'
})
export class Html5PlayerComponent extends PlayerComponentBase {
  @Input() src: string;
  @ViewChild('video') private elementView: ElementRef;
  @ViewChild('fullScreenContainer') private fullScreenContainer: ElementRef;
  @ViewChild('slider') private slider: Range;

  private ready: boolean = false;
  protected playing: boolean = false;
  protected recording: boolean = false;
  private stopTime: number = 0;
  private updatingSlider: boolean = false;
  private capturedOnce: boolean = false;
  private fullScreenView: any;

  constructor(
    public renderer: Renderer,
    public events: Events,
    public elRef: ElementRef
  ) {
    super(elRef);
  }

  get hasCapture() {
    return true;
  }

  private get video(): HTMLVideoElement {
    return this.elementView.nativeElement;
  }

  ngAfterViewInit() {
    this.video.addEventListener('pause', () => {
      this.playing = false;
    });

    this.video.addEventListener('canplaythrough', () => {
      if (this.ready) {
        // since 'canplaythrough' might be raised after pause(),
        // we don't want go through the initialization once again.
        return;
      }
      this.video.pause();
      this.ready = true;
      this.duration = this.video.duration;
      this.events.publish("player:ready");
      this.video.addEventListener('timeupdate', () => {
        this.currentTime = this.video.currentTime;
        this.events.publish('player:timeupdate',
          this.currentTime, this.playing);
        this.updatingSlider = true;
        this.slider.value = this.currentTime * 1000;
        setTimeout(() => this.updatingSlider = false);
        if (this.stopTime && this.stopTime <= this.video.currentTime) {
          this.stopTime = 0; // reset range
          this.pause();
          return;
        }
      });
      this.video.addEventListener('seeked', () => {
        this.currentTime = this.video.currentTime;
        this.events.publish('player:timeupdate',
          this.currentTime, this.playing);
      });
    });

    this.setupFloatingPlayer();
  }

  play(): Promise<any> {
    let promise: Promise<any> = this.video.play();
    // check whether the browser is able to return a promise
    if (promise && promise.then) {
      return promise.then(() => {
        this.playing = true;
        this.events.publish("player:play");
      });
    } else {
      this.playing = true;
      this.events.publish("player:play");
      return Promise.resolve();
    };
  }

  pause() {
    this.video.pause();
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
  }

  seek(to) {
    this.video.currentTime = to;
  }

  record() {
    if (this.recording) {
      this.endTime = this.video.currentTime;
      this.recording = false;
      this.events.publish("player:endrecord");
      this.pause();
    } else {
      this.recording = true;
      this.startTime = this.video.currentTime;
      this.endTime = this.startTime;
      this.captureUrl = this.capture(100);
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
    this.startTime = this.endTime = this.video.currentTime;
    this.captureUrl = this.capture(100);
    this.events.publish("player:startrecord", () => { });
    this.events.publish("player:endrecord");
  }

  slide() {
    if (!this.updatingSlider) {
      this.video.currentTime = this.slider.value / 1000;
    }
  }

  capture(preferredWidth = 50, contentType = 'image/jpeg', quality = 0.9) {
    if (preferredWidth == 0)
      preferredWidth = this.video.videoWidth;

    const canvas = document.createElement("canvas");
    const width = canvas.width = preferredWidth;
    const height = canvas.height = preferredWidth / (this.video.videoWidth / this.video.videoHeight);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(this.video, 0, 0, width, height);
    // FIXME: under iOS, the first drawImage call might not return the current
    // frame, so we retry.
    if (!this.capturedOnce) {
      this.capturedOnce = true;
      ctx.drawImage(this.video, 0, 0, width, height);
    }
    return canvas.toDataURL(contentType, quality);
  }

  toggleFullScreen() {
    if (this.fullScreenView && this.fullScreenView.isFullScreen) {
      this.fullScreenView.toggle();
      this.fullScreenView = null;
      return;
    }

    // see player.scss
    let config = {
      wrapperClass: 'lw-lichtblick-player',
      wrapperParent: document.getElementsByTagName('ion-app')[0]
    };

    this.fullScreenView = Shapes.Classes.FullScreenView.forVideoWrapper(
      this.video,
      this.fullScreenContainer.nativeElement,
      (res) => this.isFullscreen = res,
      config
    );

    this.fullScreenView.toggle();
  }

  videoClicked(event: MouseEvent) {
    // 25% left, 25% right
    if (event.offsetX < this.video.clientWidth * 0.25) {
      this.video.currentTime -= 0.05;
    } else if (event.offsetX > this.video.clientWidth * 0.75) {
      this.video.currentTime += 0.05;
    }
  }
}
