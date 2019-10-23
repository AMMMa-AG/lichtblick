import { Component, ViewChild, SecurityContext } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StateProvider } from '../../providers/state/state';
import { VisualMarkerProvider } from '../../providers/visual-marker/visual-marker';
import * as $ from 'jquery';
import Shapes from "../../lib/shapes";
import { Content } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

// configure learnweb-shapes
Shapes.Factory.configure({
  designWidth: 800
});

@IonicPage()
@Component({
  selector: 'preview-page',
  templateUrl: 'preview.html',
})
export class PreviewPage {
  @ViewChild(Content) content: Content;
  items: any[] = [];
  pending: boolean = true;
  title: string = 'Vorschau';
  shareUrl: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public state: StateProvider,
    public vmProvider: VisualMarkerProvider,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.title = this.state.title;
    this.state.getItems().then(items => {
      this.items = items;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.canvasesToImage(), 50);
  }

  canvasesToImage() {
    let elem = this.content.getElementRef().nativeElement;
    let canvases = $(elem).find('canvas');
    let canvasCount = canvases.length;
    canvases.each((index, canvas) => {
      // create shape factory & wait for the shapes to appear
      let f = new Shapes.Factory(canvas, true);
      f.done().then(() => {
        f.desktop.blur();

        if (f.desktop.getShapes().length) {
          // get a screenshot of the canvas and replace the canvas
          // with this screenshot
          f.desktop.getScreenshotBlob().then(url => {
            let img = $('<img>');
            img.attr('src', url).addClass('canvas-shim');
            $(canvas).replaceWith(img);
            this.items[index].canvasUrl = url;
          });
        } else {
          // skip empty canvas
          $(canvas).remove();
        }
        // signalize termination
        canvasCount--;
        if (canvasCount == 0) {
          this.pending = false;
        }
      });
    });
  }

  emitPage(doc) {
    doc.writeln(
      `<!DOCTYPE html>
      <html lang="de" dir="ltr">
      <head>
        <title>${this.escapeHtml(this.title)}</title>
        <base href="${window.location}">
        <link rel="stylesheet" href="assets/print/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="assets/print/styles.css">
      </head>
      <body>
      `);

    doc.writeln('<div class="container">');
    doc.writeln(`<h1 class="text-center">${this.escapeHtml(this.title)}</h1>`);

    if (this.shareUrl) {
      doc.writeln(`<p class="text-center">Geteiltes Ergebnis: <a href="${this.shareUrl}">${this.shareUrl}</a></p>`);
      doc.writeln('<hr>');
    }

    this.items.forEach((item, index) => {
      if (index != 0)
        doc.writeln('<hr>');

      let startTime = Shapes.Classes.Utils.toHHMMSS(parseFloat(item.startTime), false);
      let endTime = Shapes.Classes.Utils.toHHMMSS(parseFloat(item.endTime), false);
      let timeCode = item.startTime != item.endTime
        ? `${startTime} - ${endTime}`
        : startTime;

      let isSegment = this.state.isSegmentItem(item);
      let style = isSegment ? '' : `style="display: none"`;

      doc.writeln(`
        <div class="media">
        <div class="media-left media-bottom" ${style}>
          <a href="#">
            <img class="capture" src="${item.captureUrl}">
          </a>
        </div>
        <div class="media-body">
          <h1>${this.escapeHtml(item.title)}</h1>
          <p ${style}>TC: ${timeCode}</p>
        </div>
      </div>
      `);

      if (item.markers && item.markers.length) {
        doc.writeln(`
          <h1>Visuelle Marker</h1>
          <ul class="media-list">
        `);

        item.markers.forEach(vm => {
          let url = this.vmProvider.resolveMarkerImage(vm);
          let marker = this.vmProvider.resolveMarker(vm);
          doc.writeln(`
          <li class="media">
            <div class="media-left media-bottom">
              <a href="#">
                <img class="media-object vm" src="${url}">
              </a>
            </div>
            <div class="media-body">
              <h2 class="media-heading"></h2>
              <p>${this.escapeHtml(marker.title)}</p>
            </div>
          </li>
          `);
        });

        doc.writeln('</ul>')
      }

      let commentText = this.escapeHtml(item.text);
      if (commentText) {
        if (isSegment) {
          doc.writeln(`
            <h1>Kommentar</h1>
            <blockquote>
              <p class="text">${commentText}</p>
            </blockquote>
          `);
        } else {
          doc.writeln(`
              <p class="text">${commentText}</p>
          `);
        }
      }

      if (item.canvasUrl) {
        doc.writeln(`
          <h1>Annotationen</h1>
          <img class="canvas" src="${item.canvasUrl}">
        `);
      }
    });

    doc.writeln(`
      </div>
      </body>
      </html>
    `);
  }

  printBrowser() {
    let win = window.open('');
    let doc = win.document;

    this.state.share().then(id => {

      if (id) {
        this.shareUrl = this.state.baseUrl + '?' + "id=" + encodeURI(id);
      }

      this.emitPage(doc);
      doc.close();

      $(doc).ready(() => {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          win.onafterprint = () => win.close();
          win.print();
        } else {
          win.print();
          win.close();
        }
      });
    });
  }

  print() {
    this.printBrowser();
  }

  escapeHtml(text: string = '') {
    return (this.sanitizer.sanitize(SecurityContext.HTML, text) || '').trim();
  }
}
