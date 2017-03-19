
import { Component } from '@angular/core';

import { BeanSettings } from '../../services/bean.settings';
import { BeanListener } from '../../services/bean.listener';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class ControlSettings {
  constructor(
    public beanSettings: BeanSettings,
    public beanListener: BeanListener ) {
  }
}

