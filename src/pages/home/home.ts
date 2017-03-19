
import { Component, ChangeDetectorRef } from '@angular/core';

import { NavController, Events, Loading, LoadingController } from 'ionic-angular';

import { PickPage } from '../pick/pick';
import { ControlSettings } from '../control-settings/settings';
import { ControlStick } from '../control-stick/stick';
import { ControlColor } from '../control-color/color';
import { ControlDash } from '../control-dash/dash';

import { BeanSearch, IBeanArrayItem } from '../../services/bean.search';
import { BeanListener, BeanListenerEvent } from '../../services/bean.listener';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  isSearching = false;

  loader: Loading = undefined;

  // https://manuel-rauber.com/2016/01/05/angular-2-spinner-component/

  constructor(
    private cd: ChangeDetectorRef,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public events: Events,
    public beanSearch: BeanSearch,
    public beanListener: BeanListener) {

    this.events.subscribe(BeanListenerEvent.MessageAny, (e) => {
      console.log('HomePageController Event fired: BeanListener.MessageAny', e);
      this.cd.detectChanges();
    });
    this.events.subscribe(BeanListenerEvent.ConnectChangeProbable, () => {
      console.log('HomePageController Event fired: BeanListener.ConnectChangeProbable');
      this.cd.detectChanges();
    });

    // this.loader = loadingCtrl.create({content:'My message'});
  }

  getBeans(event: Event) {
    var self = this;

    self.isSearching = true;
    // lself.loader.present();

    self.beanSearch.isBluetoothEnabled()
    .then(function(enabled) {
      if (enabled) {
        self.beanSearch.findBeans()
        .then(function(beans) {
          console.log(beans);
          self.isSearching = false;
          self.navCtrl.push(PickPage);
          self.isSearching = false;
        })
        .catch(function(e) {
          self.isSearching = false;
          alert((e && e.message) || 'Cannot search for devices');
        });
      } else {
        self.beanSearch.sysBluetoothEnable()
        .then(function(beans) {
          self.isSearching = false;
          alert('Bluetooth was enabled, click to search for devices');
        })
        .catch(function(e) {
          self.isSearching = false;
          alert((e && e.message) || 'Cannot access bluetooth');
        });
      }
    })
    .catch(function(e) {
      self.isSearching = false;
      alert((e && e.message) || 'Error checking BlueTooth status');
    });
  }

  beanConnect(bean: IBeanArrayItem) {
    if (bean && bean.address) {
      this.beanListener.connect(bean.address)
    }
  }

  beanDisconnect(event: Event) {
    this.beanListener.disconnect();
  }

  openPage(page) {
    switch (page) {
      case 'settings':
        this.navCtrl.push(ControlSettings);
        break;
      case 'dash':
        this.navCtrl.push(ControlDash);
        break;
      case 'color':
        this.navCtrl.push(ControlColor);
        break;
      case 'stick':
        this.navCtrl.push(ControlStick);
        break;
      default:
        console.log("Can't find page: " + page);
        break;
    }
  }
}
