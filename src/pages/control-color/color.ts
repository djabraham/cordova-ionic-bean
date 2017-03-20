
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { BeanListener } from '../../services/bean.listener';
import { BeanSettings } from '../../services/bean.settings';

@Component({
  selector: 'control-color',
  templateUrl: 'color.html'
})
export class ControlColor {

  color = {
    r: 0,
    g: 0,
    b: 0
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

  setColor(pos) {
    if (pos) {
      this.color.r = Math.round(pos.r);
      this.color.g = Math.round(pos.g);
      this.color.b = Math.round(pos.b);
      this.cd.detectChanges();

      if (!this.alerted) {
        this.sendSignal('C/' + this.color.r + '/' + this.color.g + '/' + this.color.b);
      }
    }
  };
}

