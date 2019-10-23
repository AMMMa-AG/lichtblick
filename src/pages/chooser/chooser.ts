import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, TextInput } from 'ionic-angular';
import { StateProvider } from '../../providers/state/state';
import * as $ from 'jquery';
import { VisualMarkerProvider } from '../../providers/visual-marker/visual-marker';
import { URLSearchParams } from "@angular/http";
import Shapes from '../../lib/shapes';

const DropzoneOptions = {
  "dictDefaultMessage": "Ziehen Sie Ihr lokales Video zum Upload in diesen Bereich.",
  "dictFallbackMessage": "Ihr Browser unterstützt keinen Medien-Upload per Drag & Drop.",
  "dictFallbackText": "Bitte nutzen Sie das Formular unten, um Ihre Medien hochzuladen.",
  "dictFileTooBig": "Die Datei ist zu groß ({{filesize}}MB). Maximale Dateigröße: {{maxFilesize}}MB.",
  "dictInvalidFileType": "Dieser Dateityp wird nicht unterstützt.",
  "dictResponseError": "Server antwortete mit diesem Code: {{statusCode}}.",
  "dictCancelUpload": "Upload abbrechen.",
  "dictUploadCanceled": "Upload abgebrochen.",
  "dictMaxFilesExceeded": "Leider können Sie keine weiteren Dateien hochladen.",
  // disable the XMLHttpRequest timeout
  "timeout": 0,
  // we don't need Ctrl-V handling
  "disableCtrlV": true
};

@IonicPage()
@Component({
  selector: 'chooser-page',
  templateUrl: 'chooser.html',
})
export class ChooserPage {
  @ViewChild('urlTextArea') private urlTextArea: TextInput;
  text: string = '';
  title: string = '';
  categories: string[];
  selectedCategories: any[];
  version: string;
  enabled: boolean = false;
  uploadEnabled: boolean = false;
  dropzone: any;

  get isEmpty() {
    return this.text.length === 0;
  }

  get hasCategory() {
    return this.selectedCategories.find(item => item);
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private state: StateProvider,
    private vmProvider: VisualMarkerProvider
  ) {
    this.categories = this.vmProvider.dataSource.getCategories();
    this.selectedCategories = new Array(this.categories.length);
    this.selectedCategories[0] = 1;

    let params = new URLSearchParams(window.location.search.substr(1))
    let src = decodeURIComponent(params.get('src') || '');
    let title = decodeURIComponent(params.get('title') || '');
    src = src ? 'html5: ' + src : '';
    // default to test video in debug mode
    if (state.DEBUG && !src) {
      src = 'html5: assets/video/test.mp4';
    }
    this.text = src;
    this.title = title;
    this.version = $('body').attr('data-revision');

    $.getJSON(this.state.baseUrl + '../lichtblick-config.json')
      .done(data => {
        if (data.chooser) {
          this.enabled = true;
        }
        if (data.upload) {
          this.uploadEnabled = true;
          this.initUploadArea();
        }
      })
      .fail(() => {
        this.enabled = true;
        this.uploadEnabled = state.DEBUG;
        this.initUploadArea();
      });
  }

  initUploadArea() {
    if (!this.uploadEnabled) return;

    const factory = new Shapes.Factory($('<canvas>')[0]);
    factory.done().then(() => {
      this.dropzone = factory.desktop.installUploadHandler('uploadArea', DropzoneOptions, (dz, file, uri) => {
        var mimeType = file.type.substring(0, file.type.indexOf('/'));
        switch (mimeType) {
          case "video":
            this.urlTextArea.value = `html5: ${uri}`;
            break;
        }
      });
    });
  }

  ionViewWillUnload() {
    if (this.dropzone) {
      this.dropzone.destroy();
    }
  }

  textChanged() {
  }

  parseVideoUrl(url) {
    // - Supported YouTube URL formats:
    //   http://www.youtube.com/watch?v=My2FRPA3Gf8
    //   http://youtu.be/My2FRPA3Gf8
    //   https://youtube.googleapis.com/v/My2FRPA3Gf8
    // - Supported Vimeo URL formats:
    //   http://vimeo.com/25451551
    //   http://player.vimeo.com/video/25451551
    // - Also supports relative URLs:
    //   //player.vimeo.com/video/25451551

    const invalid = {
      provider: undefined,
      id: undefined,
      url: undefined
    };

    // plain HTML5 video
    if (url.match(/^html5:\s*(.+?)\s*$/)) {
      return {
        provider: 'html5',
        id: undefined,
        url: RegExp.$1
      }
    }

    //                      1                  2              3                4                                    5                               6
    const res = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
    if (!res) {
      return invalid;
    }

    const providerString = res[3] || '';
    const id = res[6];

    if (!(providerString && id)) {
      return invalid;
    }

    let provider;
    if (providerString.indexOf('youtu') >= 0) {
      provider = 'youtube';
    } else if (providerString.indexOf('vimeo') >= 0) {
      provider = 'vimeo';
    }

    let canonicalUrl;

    switch (provider) {
      case "youtube":
        canonicalUrl = 'https://youtu.be/' + id;
        break;
      case "vimeo":
        canonicalUrl = 'https://player.vimeo.com/video/' + id;
        break;
    }

    return {
      provider,
      id,
      url: canonicalUrl
    };
  }

  embed() {
    const res = this.parseVideoUrl(this.text);

    if (res.provider) {
      const categories = this.selectedCategories.map((item, index) => {
        return item ? index : undefined
      }).filter(item => item != undefined);

      this.state.redirect([
        { name: 'src', value: res.url },
        { name: 'title', value: this.title || 'Lichtblick' },
        { name: 'cat', value: categories }
      ]);
    } else {
      const toast = this.toastCtrl.create({
        message: 'Es wurde keine gültige Video-URL gefunden.',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    }
  }

  focus(event: Event) {
    $(event.srcElement).parents('ion-item').addClass('rounded-focus');
  }

  blur(event: Event) {
    $(event.srcElement).parents('ion-item').removeClass('rounded-focus');
  }
}
