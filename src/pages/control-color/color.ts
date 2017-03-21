
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { BeanListener } from '../../services/bean.listener';
import { BeanSettings } from '../../services/bean.settings';

import * as Stick from '../../components/control-pad';

@Component({
  selector: 'control-color',
  templateUrl: 'color.html'
})
export class ControlColor {

  color = {
    r: '000',
    g: '000',
    b: '000'
  }

  alerted: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    public navCtrl: NavController,
    public beanListener: BeanListener,
    public beanSettings: BeanSettings ) {
  }

  // signal is one of BeanSignal (above)
  sendSignal(signal: string) {
    var self = this;
    return self.beanListener.sendSerialData(signal)
    .then(function(msg) {
      // console.log(msg);
    })
    .catch(function(e){
      if (!self.alerted) {
        self.alerted = true;

        Observable.timer(500).subscribe(t=> {
          alert((e && e.message) || 'Error: Check connection');
          self.navCtrl.pop();
        });
      }
    });
  }

  strPrev: string = '';

  setColor(changeValue: Stick.IChangeValue) {
    if (changeValue) {
      this.color.r = changeValue.rgb.r;
      this.color.g = changeValue.rgb.g;
      this.color.b = changeValue.rgb.b;

      if (!this.alerted) {
        var str = 'C/' + changeValue.rgb.r + '/' + changeValue.rgb.g + '/' + changeValue.rgb.b;
        this.strPrev = str;
        this.sendSignal(str);
      }

      this.cd.detectChanges();
    }
  };
}

