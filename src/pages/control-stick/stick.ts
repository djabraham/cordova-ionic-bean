
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { BeanListener } from '../../services/bean.listener';
import { BeanSettings } from '../../services/bean.settings';

import * as Stick from '../../components/control-pad';

@Component({
  selector: 'control-stick',
  templateUrl: 'stick.html'
})
export class ControlStick {

  stick = {
    x: 0,
    y: 0,
    square: true,
    snappy: true
  }

  alerted: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    public navCtrl: NavController,
    public beanListener: BeanListener,
    public beanSettings: BeanSettings) {
  }

  // signal is one of BeanSignal (above)
  sendSignal(signal: string) {
    var self = this;
    return self.beanListener.sendSerialData(signal)
      .then(function (msg) {
        // console.log(msg);
        self.alerted = false;
      })
      .catch(function (e) {
        if (!self.alerted) {
          self.alerted = true;

          Observable.timer(500).subscribe(t => {
            alert((e && e.message) || 'Error: Check connection');
            self.navCtrl.pop();
          });
        }
      });
  }

  setPosition(changeValue: Stick.IChangeValue) {
    var self = this;
    this.stick.x = Math.round(changeValue.pos.x);
    this.stick.y = Math.round(changeValue.pos.y);
    this.cd.detectChanges();

    if (!self.alerted) {
      this.sendSignal('P/' + this.stick.x + '/' + this.stick.y);
    }
  };
}

