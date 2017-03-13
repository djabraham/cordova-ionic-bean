
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
  selector: 'page-signal',
  templateUrl: 'signal.html'
})
export class SignalPage {
  // assigns the interface of any type to the enum
  beanSignal: IBeanSignalEnum = BeanSignalEnum;

  stick = {
    square: true,
    snappy: true,
    position: {
      x: 0,
      y: 0
    },
    alerted: false
  }

  constructor(
    private cd: ChangeDetectorRef,
    public navCtrl: NavController,
    public beanListener: BeanListener ) {
  }

  // signal is one of BeanSignal (above)
  sendSignal(signal: string) {
    var self = this;
    return self.beanListener.sendSerialData(signal)
    .then(function(msg) {
      // console.log(msg);
      self.stick.alerted = false;
    })
    .catch(function(e){
      if (!self.stick.alerted) {
        self.stick.alerted = true;

        Observable.timer(500).subscribe(t=> {
          alert((e && e.message) || 'Error: Check connection');
          self.navCtrl.pop();
        });
      }
    });
  }

  setPosition(pos) {
    var self = this;

    if (pos) {
      this.stick.position.x = Math.round(pos.x);
      this.stick.position.y = Math.round(pos.y);
      this.cd.detectChanges();

      if (!self.stick.alerted) {
        this.sendSignal('P/' + this.stick.position.x + '/' + this.stick.position.y);
      }
    }
  };
}

