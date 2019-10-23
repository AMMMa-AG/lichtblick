import * as shapes from 'learnweb-shapes';
import * as $ from 'jquery';
(<any>window).$ = $;

/**
 * Wraps learnweb-shapes.
 */
export default class Shapes {
  /**
   * Returns the Factory class of the shapes lib.
   */
  static get Factory() {
    return shapes.Factory;
  }

  /**
   * Retuns the Classes namespace of the shapes lib.
   */
  static get Classes() {
    return shapes.Factory.Classes;
  }

  /**
   * Returns the Shape class of the shapes lib.
   */
  static get Shape() {
    return shapes.Shape;
  }

  /**
   * Returns the Utils class of the shapes lib.
   */
  static get Utils() {
    return shapes.Utils;
  }

  /**
   * Retuns the PositionHelper class of the shapes lib.
   */
  static get PositionHelper() {
    return shapes.PositionHelper;
  }
}
