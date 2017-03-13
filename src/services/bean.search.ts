
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { Events } from 'ionic-angular';

var PluginBean:any = (<any>window).PTBeanPlugin;
var Cordova:any = (<any>window).cordova;

export enum BeanPluginEventEnum {
  IsEnabledTrue         = <any> "isEnabledTrue",
  IsEnabledFalse        = <any> "isEnabledFalse",
  IsEnabledError        = <any> "isEnabledError",
  EnableSuccess         = <any> "enableSuccess",
  EnableError           = <any> "enableError",
  SelectSuccess         = <any> "selectSuccess",
  SelectError           = <any> "selectError",
  SearchSuccess         = <any> "searchSuccess",
  SearchError           = <any> "searchError",
}

// http://stackoverflow.com/a/33748659/1759357
// enum are number type, this enables access of enum strings as type any
export interface IBeanPluginEventEnum {
  IsEnabledTrue;
  IsEnabledFalse;
  IsEnabledError;
  EnableSuccess;
  EnableError;
  SelectSuccess;
  SelectError;
  SearchSuccess;
  SearchError;
}

// assigns the interface of any type to the enum
export var BeanPluginEvent: IBeanPluginEventEnum = BeanPluginEventEnum;

export interface IBeanArrayItem {
  name: string;
  address: string;
}

export const BEANS: IBeanArrayItem[] = [
  { name: 'Dano\'s Mocked Bean', address: '9C:7F:3B:2D:67'},
  { name: 'Jack\'s Magical Mocked Bean', address: '9C:7F:3B:2D:69'}
];

@Injectable()
export class BeanSearch {
  isEnabled: boolean = false;
  isDisabled: boolean = true;
  isSearching: boolean = false;

  // plugin discover service reutns beans nearby
  beansFound: IBeanArrayItem[] = [];

  // stores bean the user selected from those found nearby
  beanSelected: IBeanArrayItem = {
    name: undefined,
    address: undefined
  };

  constructor(public events: Events) { }

  public isBluetoothEnabled() {
    var self = this;
    return new Promise<Boolean>(function(resolve, reject) {

      let timer = Observable.timer(250);
      timer.subscribe(t=> {
        if (!PluginBean) {
          // mocking
          self.isEnabled = true;
          return resolve(true);
        } else {
          Cordova.exec(
            function(result) {
              if (result && result.enabled) {
                console.log(BeanPluginEvent.IsEnabledTrue);
                self.isEnabled = true;
                self.isDisabled = false;
                self.events.publish(BeanPluginEvent.IsEnabledTrue);
              } else {
                self.isEnabled = false;
                self.isDisabled = true;
                console.log(BeanPluginEvent.IsEnabledFalse);
                self.events.publish(BeanPluginEvent.IsEnabledFalse);
              }
              return resolve(result && result.enabled);
            },
            function(e) {
              console.log(BeanPluginEvent.IsEnabledError, e);
              self.events.publish(BeanPluginEvent.IsEnabledError, e);
              self.isEnabled = false;
              self.isDisabled = true;
              return reject(new Error((e && e.message) || BeanPluginEvent.IsEnabledError));
            },
            'PTBeanPlugin',
            'isenabled',
            []
          );
        };
      });
    });
  }

  public sysBluetoothEnable() {
    var self = this;
    return new Promise<Boolean>(function(resolve, reject) {

      if (self.isEnabled) {
        return resolve(true);
      }

      let timer = Observable.timer(500);
      timer.subscribe(t=> {
        if (!PluginBean) {
          // mocking
          return resolve(true);
        } else {
          Cordova.exec(
            function() {
              console.log(BeanPluginEvent.EnableSuccess);
              self.events.publish(BeanPluginEvent.EnableSuccess);
              self.isEnabled = true;
              self.isDisabled = false;
              return resolve(true);
            },
            function(e) {
              console.log(BeanPluginEvent.EnableError, e);
              self.events.publish(BeanPluginEvent.EnableError, e);
              self.isEnabled = false;
              self.isDisabled = true;
              return reject(new Error((e && e.message) || BeanPluginEvent.EnableError));
            },
            'PTBeanPlugin',
            'enable',
            []
          );
        };
      });
    });
  }

  public setSelectedBean(bean: IBeanArrayItem) {
    this.beanSelected.name = bean.name;
    this.beanSelected.address = bean.address;

    var self = this;
    return new Promise<IBeanArrayItem>(function(resolve, reject) {
      if (PluginBean) {
        Cordova.exec(
          function() {
            console.log(BeanPluginEvent.SelectSuccess);
            self.events.publish(BeanPluginEvent.SelectSuccess);
            return resolve(self.beanSelected);
          },
          function(e) {
            console.log(BeanPluginEvent.SelectError, e);
            self.events.publish(BeanPluginEvent.SelectError, e);
            return reject(new Error((e && e.message) || BeanPluginEvent.SelectError));
          },
          'PTBeanPlugin',
          'select',
          [ bean.address ]
        );
      };
    });
  }

  public findBeans(): Promise<IBeanArrayItem[]> {

    this.isSearching = true;

    var self = this;
    return new Promise<IBeanArrayItem[]>(function(resolve, reject) {

      let timer = Observable.timer(500);

      // allow additional moment for 3rd party bean lib to init
      timer.subscribe(t=> {
        if (!PluginBean) {
          // mocking
          self.isSearching = false;
          self.beansFound = BEANS;
          console.log(BeanPluginEvent.SearchSuccess + ' (mocked)', BEANS);
          self.events.publish(BeanPluginEvent.SearchSuccess, BEANS);
          return resolve(BEANS);
        } else {
          Cordova.exec(
            function(beans) {
              self.isSearching = false;
              self.beanSelected.name = undefined;
              self.beanSelected.address = undefined;
              self.beansFound = beans;
              console.log(BeanPluginEvent.SearchSuccess, beans);
              self.events.publish(BeanPluginEvent.SearchSuccess, beans);
              return resolve(beans);
            },
            function(e) {
              self.isSearching = false;
              console.log(BeanPluginEvent.SearchError, e);
              self.events.publish(BeanPluginEvent.SearchError, e);
              return reject(new Error((e && e.message) || BeanPluginEvent.SearchError));
            },
            'PTBeanPlugin',
            'find',
            []
          );
        };
      });
    });
  }
}