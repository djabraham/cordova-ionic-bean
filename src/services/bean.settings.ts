
import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';

@Injectable()
export class BeanSettings {
  private _throttle: number = 20;

  constructor(public events: Events) { }

  /** throttle (i.e. 50ms) is used to debounce messages */
  get throttle(): number {
    return this._throttle;
  }

  /**
   * sets the global message debounce throttle
   * pages manage this and provide the value to controls
   * recommend a relatively small delay for real time controls (i.e. 10 - 50ms)
   */
  set throttle(val) {
    if ((val >= 0) && (val <= 1000)) {
      this._throttle = val;
    }
  }
}