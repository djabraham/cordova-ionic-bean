import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BeanSettings } from '../services/bean.settings';
import { BeanSearch } from '../services/bean.search';
import { BeanListener } from '../services/bean.listener';
import { ControlPad } from '../components/control-pad';
import { ControlSettings } from '../pages/control-settings/settings';
import { ControlStick } from '../pages/control-stick/stick';
import { ControlColor } from '../pages/control-color/color';
import { ControlDash } from '../pages/control-dash/dash';
import { PickPage } from '../pages/pick/pick';
import { HomePage } from '../pages/home/home';

@NgModule({
  declarations: [
    MyApp,
    ControlPad,
    ControlSettings,
    ControlStick,
    ControlColor,
    ControlDash,
    HomePage,
    PickPage,
  ],
  imports: [
    IonicModule.forRoot(MyApp,{

    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PickPage,
    ControlStick,
    ControlSettings,
    ControlStick,
    ControlColor,
    ControlDash,
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: BeanSettings, useClass: BeanSettings },
    { provide: BeanListener, useClass: BeanListener },
    { provide: BeanSearch, useClass: BeanSearch }
  ]
})

export class AppModule {}

