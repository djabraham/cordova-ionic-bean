
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { BeanListener } from '../../services/bean.listener';

export enum BeanSignalEnum {
  LockOpen         = <any> "S/LOCK/0",
  LockShut         = <any> "S/LOCK/1",
  LightOff         = <any> "S/LIGHT/0",
  LightOn          = <any> "S/LIGHT/1"
}

// http://stackoverflow.com/a/33748659/1759357
// enum are number type, this enables access of enum strings as type any
export interface IBeanSignalEnum {
  LockOpen;
  LockShut;
  LightOff;
  LightOn;
}

@Component({
  selector: 'control-dash',
  templateUrl: 'dash.html'
})
export class ControlDash {
  // assigns the interface of any type to the enum
  beanSignal: IBeanSignalEnum = BeanSignalEnum;

  alerted: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    public navCtrl: NavController,
    public beanListener: BeanListener ) {
  }

  // signal is one of BeanSignal (above)
  sendSignal(signal: IBeanSignalEnum) {
    var self = this;
    return self.beanListener.sendSerialData(<any>signal)
    .then(function(msg) {
      // console.log(msg);
    })
    .catch(function(e){
      if (!self.alerted) {
        self.alerted = true;
        Observable.timer(100).subscribe(t=> {
          alert((e && e.message) || 'Error: Check connection');
          self.navCtrl.pop();
        });
      }
    });
  }
}

