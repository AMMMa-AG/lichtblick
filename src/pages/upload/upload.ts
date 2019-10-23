import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import Shapes from '../../lib/shapes';

const DropzoneOptions = {
  "dictDefaultMessage": "Ziehen Sie Ihre Medien zum Upload in dieses Fenster.",
  "dictFallbackMessage": "Ihr Browser unterstützt keinen Medien-Upload per Drag & Drop.",
  "dictFallbackText": "Bitte nutzen Sie das Formular unten, um Ihre Medien hochzuladen.",
  "dictFileTooBig": "Die Datei ist zu groß ({{filesize}}MB). Maximale Dateigröße: {{maxFilesize}}MB.",
  "dictInvalidFileType": "Dieser Dateityp wird nicht unterstützt.",
  "dictResponseError": "Server antwortete mit diesem Code: {{statusCode}}.",
  "dictCancelUpload": "Upload abbrechen.",
  "dictUploadCanceled": "Upload abgebrochen.",
  "dictMaxFilesExceeded": "Leider können Sie keine weiteren Dateien hochladen.",
  // disable the XMLHttpRequest timeout
  "timeout": 0
};

// static position helpers
const imagePos = new Shapes.PositionHelper(150, 150, 10);
const videoPos = new Shapes.PositionHelper(250, 100, 10);
const audioPos = new Shapes.PositionHelper(150, 300, 10);

@IonicPage()
@Component({
  selector: 'upload-page',
  templateUrl: 'upload.html',
})
export class UploadPage {

  dropzone: any;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams
  ) {
  }

  ionViewDidLoad() {
    const factory = this.navParams.get('factory');

    this.dropzone = factory.desktop.installUploadHandler('uploadArea', DropzoneOptions, (dz, file, uri) => {
      var mimeType = file.type.substring(0, file.type.indexOf('/'));
      switch (mimeType) {
        case "image":
          factory.createDraggable({
            ...imagePos.pos(),
            persist: true,
            path: uri,
            width: 200,
            layer: Shapes.Shape.ImageLayer
          });
          break;
        case "video":
          factory.createPlayer({
            ...videoPos.pos(),
            persist: true,
            path: uri,
            width: 200,
            pinable: false,
            regPoint: 1,
            layer: Shapes.Shape.ImageLayer
          });
          break;
        case "audio":
          factory.createAudioPlayer({
            ...audioPos.pos(),
            persist: true,
            path: uri,
            width: 200,
            pinable: false,
            layer: Shapes.Shape.ToolLayer
          });
          break;
      }
    });
  }

  ionViewWillUnload() {
    if (this.dropzone) {
      this.dropzone.destroy();
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
