
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { BeanListener } from '../../services/bean.listener';

export enum BeanSignalEnum {
  Lock1Open        = <any> "S/LOCK/1/0",
  Lock1Shut        = <any> "S/LOCK/1/1",
  Lock2Open        = <any> "S/LOCK/2/0",
  Lock2Shut        = <any> "S/LOCK/2/1",
  Light1Off        = <any> "S/LIGHT/1/0",
  Light1On         = <any> "S/LIGHT/1/1",
  Light2Off        = <any> "S/LIGHT/2/0",
  Light2On         = <any> "S/LIGHT/2/1"
}

// http://stackoverflow.com/a/33748659/1759357
// enum are number type, this enables access of enum strings as type any
export interface IBeanSignalEnum {
  Lock1Open;
  Lock1Shut;
  Lock2Open;
  Lock2Shut;
  Light1Off;
  Light1On;
  Light2Off;
  Light2On;
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

