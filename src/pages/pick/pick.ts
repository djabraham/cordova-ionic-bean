
import { Component, ViewChild } from '@angular/core';

import { NavController } from 'ionic-angular';
import { List } from 'ionic-angular';

import { BeanSearch, IBeanArrayItem } from '../../services/bean.search';

@Component({
  selector: 'page-beans',
  templateUrl: 'pick.html'
})
export class PickPage {
  @ViewChild(List) list: List;

  constructor(
    public navCtrl: NavController,
    public beanSearch: BeanSearch ) {
  }

  stopSliding() {
    this.list.sliding = false;
  }

  beanSelected(b: IBeanArrayItem) {
    this.beanSearch.setSelectedBean(b)
    this.navCtrl.pop();
  }
}

