import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlayerComponent } from "../player/player";
import Shapes from "../../lib/shapes";
import * as $ from 'jquery';
import { ModalController, Events, AlertController } from 'ionic-angular';
import { debounce } from 'lodash';

const DESIGN_WIDTH = 800;
const DESIGN_HEIGHT = 600;

// configure learnweb-shapes
Shapes.Factory.configure({
  designWidth: DESIGN_WIDTH
});

// colors
const btnColorBlue = "#83CCDC";
const btnColorRed = "#DC8383";
const btnColorOrange = "#EDA432";
const btnColorGreen = "#53BC48";
const btnColorFont = "#000";


@Component({
  selector: 'item-canvas-detail',
  templateUrl: 'item-canvas-detail.html'
})
export class ItemCanvasDetailComponent {
  @ViewChild('fullScreenContainer') private fullScreenContainer: ElementRef;
  @ViewChild('shapesContainer') private shapesContainer: ElementRef;

  player: PlayerComponent;
  factory: any;
  factories: Map<string, any> = new Map();
  state: any;
  isFullScreen: boolean;
  supportsFullScreen: boolean = true;
  fullScreenView: any;
  ready: boolean = false;

  constructor(
    private elRef: ElementRef,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    public events: Events) {
  }

  /**
   * Invoked when the control should be displayed.
   */
  show() {
    // refresh the shapes by asking the factory to refresh all
    // (visible) canvas on the page.
    Shapes.Factory.refresh();
  }

  /**
   * Invoked when the control is being hidden.
   */
  hide() {
    // nothing to do.
  }

  ngAfterViewInit() {
    this.supportsFullScreen = Shapes.Classes.FullScreenView.containerSupported();
  }

  /**
   * loads the shape factory with the specified uid. creates a new one,
   * if it didn't exist. returns a promise that resolves when the canvas
   * has been fully loaded.
   *
   * @param uid
   * @returns Promise
   */
  load(uid) {
    let id = 'c' + uid;
    let elem: HTMLElement = this.elRef.nativeElement;

    // hide all canvas...
    $(elem).find('.learnweb-shapes').hide();

    let canvas = document.getElementById(id);
    if (canvas) {
      // ...and show the canvas in question...
      $(canvas).parent().show();
    } else {
      // ...unless it didn't exist, so let's create it.
      let newCanvas = $(`<canvas>`)
        .attr('id', id)
        .attr('height', DESIGN_HEIGHT);

      // create canvas' learnweb-shapes container
      let container = $('<div>')
        .addClass('learnweb-shapes')
        .append(newCanvas);

      // append the whole thing to shapesContainer
      $(this.shapesContainer.nativeElement)
        .append(container);

      // create factory of the new canvas
      let factory = new Shapes.Factory(newCanvas[0], true);
      this.initFactoryState(factory);
      factory.desktop.on('desktop:shapeschanged', debounce(() => {
        factory._lichtblick.shapesCount = factory.desktop.getShapes().length;
        this.events.publish('itemdetail:changed');
      }, 250));
      factory.done().then(() => {
        this.ready = true;
        factory._lichtblick.shapesCount = factory.desktop.getShapes().length;
      });
      this.factories.set(id, factory);
    }

    // initialize from cache
    this.factory = this.factories.get(id);
    this.state = this.factory._lichtblick;
    return this.factory.done();
  }

  /**
   * Initializes the per-factory local state.
   *
   * @param factory
   */
  initFactoryState(factory) {
    factory._lichtblick = {};
    factory._lichtblick.shapePos = new Shapes.PositionHelper(40, 40, 10);
    factory._lichtblick.textPos = new Shapes.PositionHelper(100, 100, 10);
    return factory._lichtblick;
  }

  /**
   * Returns the count of the shapes being currently displayed on the
   * desktop of the canvas.
   */
  get shapesCount() {
    return this.factory ? this.factory._lichtblick.shapesCount : 0;
  }

  /**
   * Returns all draggables from the desktop.
   */
  getDraggables() {
    if (this.factory)
      return this.factory.desktop.getShapes().filter(shape => shape.shapeClassName == "Draggable");
    else
      return [];
  }

  captureVideo() {
    if (this.player.hasCapture) {
      let dataUrl = this.player.capture(0);
      let label = Shapes.Classes.Utils.toHHMMSS(this.player.currentTime, false);

      this.factory.createDraggable({
        persist: true,
        labelText: label,
        path: dataUrl,
        width: 200,
        x: 120,
        y: 100,
        deletable: true,
        resizable: true,
        rotatable: false,
        regPoint: 1,
        layer: Shapes.Shape.BackgroundLayer
      });
    } else {
      if (this.factory) {
        this.leaveFullScreen();
        this.modalCtrl.create('UploadPage', {
          factory: this.factory
        }).present();
      }
    }
  }

  createCircle() {
    this.factory.createCircle({
      adjustable: true,
      persist: true,
      width: 40,
      ...this.state.shapePos.pos(),
      color: btnColorBlue,
      backgroundColor: btnColorBlue,
      backgroundAlpha: 0.01,
      strokeWidth: 6,
      deletable: true,
      resizable: true,
      proportional: false,
      rotatable: true,
      regPoint: 1
    });
  }

  createRect() {
    this.factory.createRectangle({
      adjustable: true,
      persist: true,
      width: 40,
      ...this.state.shapePos.pos(),
      color: btnColorRed,
      backgroundColor: btnColorRed,
      backgroundAlpha: 0.01,
      strokeWidth: 6,
      deletable: true,
      resizable: true,
      proportional: false,
      rotatable: true,
      regPoint: 1
    });
  }

  createTriangle() {
    this.factory.createTriangle({
      adjustable: true,
      persist: true,
      width: 40,
      ...this.state.shapePos.pos(),
      color: btnColorOrange,
      backgroundColor: btnColorOrange,
      backgroundAlpha: 0.01,
      strokeWidth: 6,
      deletable: true,
      resizable: true,
      proportional: false,
      rotatable: true,
      regPoint: 1
    });
  }

  createText() {
    this.factory.createTextfield({
      adjustable: true,
      persist: true,
      width: 160,
      ...this.state.textPos.pos(),
      text: "Text",
      dragAlpha: 0.6,
      dragColor: "#bababa",
      backgroundColor: "#fff",
      textColor: btnColorFont,
      deletable: true,
      resizable: true,
      fitFont: false
    });
  }

  createArrowText() {
    const pos = this.state.textPos.pos();
    this.factory.createArrowNote({
      persist: true,
      length: 100,
      arrowWidth: 25,
      x: pos.x + 150,
      y: pos.y,
      color: '#83CCDC',
      strokeWidth: 7,
      strokeStyle: 0,
      adjustable: true
    }, {
        adjustable: true,
        width: 160,
        ...pos,
        text: "Text",
        dragAlpha: 0.6,
        dragColor: '#83CCDC',
        backgroundColor: '#fff',
        textColor: '#000',
        resizable: false
      });
  }

  createSimpleLine() {
    this.factory.createArrow({
      adjustable: true,
      persist: true,
      heads: 0,
      length: 100,
      arrowWidth: 25,
      ...this.state.textPos.pos(),
      color: btnColorOrange,
      strokeWidth: 7,
      deletable: true,
      strokeStyle: 0
    });
  }

  createLine() {
    this.factory.createArrow({
      adjustable: true,
      persist: true,
      heads: 1,
      length: 100,
      arrowWidth: 25,
      ...this.state.textPos.pos(),
      color: btnColorGreen,
      strokeWidth: 7,
      deletable: true,
      strokeStyle: 0
    });
  }

  createDoubleDashedLine() {
    this.factory.createArrow({
      adjustable: true,
      persist: true,
      heads: 2,
      length: 100,
      arrowWidth: 25,
      ...this.state.textPos.pos(),
      color: btnColorGreen,
      strokeWidth: 7,
      deletable: true,
      strokeStyle: 1
    });
  }

  createCam() {
    const pos = this.state.textPos.pos();
    this.factory.createArrowDraggable({
      persist: true,
      length: length,
      arrowWidth: 25,
      x: pos.x + 50,
      y: pos.y + 50,
      color: btnColorGreen,
      strokeWidth: 7,
      strokeStyle: 0,
      adjustable: true
    }, {
        path: "assets/images/cam.svg",
        width: 30,
        ...pos,
        deletable: true,
        resizable: false,
        rotatable: true,
        regPoint: 1,
        rotate: false,
        rotationOffset: 90
      });
  }

  createNumber() {
    if (!this.state.createNumberOptions) {
      this.state.createNumberOptions = {
        x: 20,
        y: 20,
        value: 1
      };
    }
    let opt = this.state.createNumberOptions;

    this.factory.createNumbering({
      persist: true,
      value: opt.value++,
      width: 30,
      x: opt.x,
      y: opt.y,
      backgroundColor: "#1E90FF",
      backgroundAlpha: 0.9,
      deletable: true,
      resizable: false,
      proportional: true,
      rotatable: false,
      regPoint: 0
    });

    if (opt.y <= 400) {
      opt.y += 10;
    } else {
      opt.y = 20;
    }

    if (opt.x <= 600) {
      opt.x += 10;
    } else {
      opt.x = 20;
    }
  }

  createPipette() {
    let picker = this.factory.createColorPicker();
    picker.show();
  }

  createFreehand() {
    let freehand = this.factory.createFreehandDrawing();
    freehand.show("#3399CC", 2);
  }

  createCroppedImage() {
    let crop = this.factory.createCroppedImage();
    crop.show(0);
  }

  createTextBubble() {
    this.factory.createSpeechBubble({
      adjustable: true,
      persist: true,
      width: 180,
      ...this.state.textPos.pos(),
      text: "Text",
      backgroundColor: "#fff",
      textColor: "#000",
      strokeColor: '#000',
      strokeWidth: 2,
      deletable: true,
      bubbleStyle: 2
    });
  }

  createSpeechBubble() {
    this.factory.createSpeechBubble({
      adjustable: true,
      persist: true,
      width: 180,
      ...this.state.textPos.pos(),
      text: "Sprache",
      backgroundColor: "#fff",
      textColor: "#000",
      strokeColor: '#000',
      strokeWidth: 2,
      deletable: true,
      bubbleStyle: 1
    });
  }

  createThoughtBubble() {
    this.factory.createSpeechBubble({
      adjustable: true,
      persist: true,
      width: 180,
      ...this.state.textPos.pos(),
      text: "Gedanke",
      backgroundColor: "#fff",
      textColor: "#000",
      strokeColor: '#000',
      strokeWidth: 2,
      deletable: true,
      bubbleStyle: 0
    });
  }

  toggleFullScreen() {
    if (this.leaveFullScreen()) return;

    // see item-canvas-detail.scss
    let config = {
      wrapperClass: 'lw-item-canvas-detail'
    };

    this.fullScreenView = Shapes.Classes.FullScreenView.forWrapper(
      this.fullScreenContainer.nativeElement,
      (res) => this.isFullScreen = res,
      config
    );
    this.fullScreenView.toggle();
  }

  leaveFullScreen() {
    if (this.fullScreenView && this.fullScreenView.isFullScreen) {
      this.fullScreenView.toggle();
      this.fullScreenView = null;
      return true;
    }
    return false;
  }

  clear() {
    if (this.factory) {
      this.factory.desktop.clear();
      // clear state
      this.state = this.initFactoryState(this.factory);
    }
  }

  openClear() {
    let alert = this.alertCtrl.create({
      title: '',
      message: 'Möchten Sie den Desktop leeren? Diese Aktion kann nicht rückgängig gemacht werden.',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'OK',
          handler: () => this.clear()
        }
      ]
    });
    alert.present();
  }
}
