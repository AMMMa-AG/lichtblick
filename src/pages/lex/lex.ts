import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ViewController } from 'ionic-angular';
import { VisualMarkerProvider, LexData } from "../../providers/visual-marker/visual-marker";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@IonicPage()
@Component({
  selector: 'lex-page',
  templateUrl: 'lex.html',
})
export class LexPage {
  @ViewChild('content') private content: Content;

  title: string;
  fileName: string;
  html: SafeHtml;
  navigationStack: string[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private sanitizer: DomSanitizer,
    public vmProvider: VisualMarkerProvider
  ) {
    this.fileName = navParams.get('fileName');
  }

  ngOnInit() {
    this.loadEntry(this.fileName, false);
  }

  presentLex(data: LexData) {
    this.html = this.sanitizer.bypassSecurityTrustHtml(data.html);
    this.title = data.title;

    setTimeout(() => {
      let elem = this.content._elementRef.nativeElement;
      let links: HTMLAnchorElement[] = [].slice.call(elem.getElementsByTagName('a'), 0);
      links.forEach(item => {
        let href = item.getAttribute('href');
        if (href && href.startsWith('lex_')) {
          item.addEventListener('click', (event) => {
            event.preventDefault();
            this.loadEntry(href);
          });
        } else {
          item.setAttribute("target", "_blank");
        }
      })
    });
  }

  loadEntry(fileName, doPush = true) {
    if (doPush)
      this.navigationStack.push(this.fileName);
    this.fileName = fileName;
    this.vmProvider.getLex(fileName).then(data => this.presentLex(data));
  }

  goBack() {
    if (this.navigationStack.length) {
      this.loadEntry(this.navigationStack.pop(), false);
    } else {
      this.close();
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
