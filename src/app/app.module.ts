import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { PickPage } from '../pages/pick/pick';
import { HomePage } from '../pages/home/home';
import { SignalPage } from '../pages/signal/signal';
import { BeanSearch } from '../services/bean.search';
import { BeanListener } from '../services/bean.listener';
import { ControlPad } from '../components/control-pad';
import { ModalWorking } from '../components/modal-working';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PickPage,
    SignalPage,
    ControlPad,
    ModalWorking
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
    SignalPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: BeanListener, useClass: BeanListener },
    { provide: BeanSearch, useClass: BeanSearch }
  ]
})

export class AppModule {}

