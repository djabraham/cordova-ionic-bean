
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { Events } from 'ionic-angular';

var PluginBean:any = (<any>window).PTBeanPlugin;
var Cordova:any = (<any>window).cordova;

export enum BeanListenerEventEnum {
  NotReady                = <any> "notReady",
  WasConnecting           = <any> "wasConnecting",
  WasListening            = <any> "wasListening",
  NotListening            = <any> "notListening",
  NotConnected            = <any> "notConnected",
  StillConnecting         = <any> "stillConnecting",

  Connecting              = <any> "connecting",
  ConnectChangeProbable   = <any> "connectChangeProbable",
  ConnectError            = <any> "connectError",
  DisconnectError         = <any> "disconnectError",
  DisconnectSuccess       = <any> "disconnectSuccess",
  SerialError             = <any> "serialError",
  SerialSuccess           = <any> "serialSuccess",

  MessageConnectSuccess   = <any> "messageConnectSuccess",
  MessageConnectFailed    = <any> "messageConnectFailed",
  MessageDisconnected     = <any> "messageDisconnected",
  MessageSerial           = <any> "messageSerial",
  MessageScratch          = <any> "messageScratch",
  MessageRssi             = <any> "messageRssi",
  MessageError            = <any> "messageError",
  MessageUnknown          = <any> 'messageUnknown',
  MessageAny              = <any> 'messageAny',
}

// enum are number type, this enables access of enum strings as type any
export interface IBeanListenerEventEnum {
  NotReady;
  WasConnecting;
  WasListening;
  NotListening;
  NotConnected;
  StillConnecting;

  Connecting;
  ConnectChangeProbable;
  ConnectError;
  DisconnectError;
  DisconnectSuccess;
  SerialError;
  SerialSuccess;

  MessageConnectSuccess;
  MessageConnectFailed;
  MessageDisconnected;
  MessageSerial;
  MessageScratch;
  MessageRssi;
  MessageError;
  MessageUnknown;
  MessageAny;
}

// assigns the interface of any type to the enum
export var BeanListenerEvent: IBeanListenerEventEnum = BeanListenerEventEnum;

// type MessageType = 'connected' | 'connectionFailed' | 'disconnected' | 'serialMessageReceived' | 'scratchValueChanged' | 'error' | 'rssiReadRemote';

export enum MsgTypeEnum {
  Connected             = <any> 'connected',
  ConnectionFailed      = <any> 'connectionFailed',
  SerialMessageReceived = <any> 'serialMessageReceived',
  ScratchValueChanged   = <any> 'scratchValueChanged',
  RssiReadRemote        = <any> 'rssiReadRemote',
  Disconnected          = <any> 'disconnected',
  Error                 = <any> 'error'
}

// enum are number type, this enables access of enum strings as type any
export interface IMsgTypeEnum {
  Connected;
  ConnectionFailed;
  SerialMessageReceived;
  ScratchValueChanged;
  RssiReadRemote;
  Disconnected;
  Error;
};

// assigns the interface of any type to the enum
export var MsgType: IMsgTypeEnum = MsgTypeEnum;

export interface IMsg {
  type: MsgTypeEnum;
}
export interface IMsgConnected extends IMsg {
  hardwareVersion: string;
  firmwareVersion: string;
  sofwareVersion: string;
}
export interface IMsgConnectionFailed extends IMsg {
}
export interface IMsgSerialMessageReceived extends IMsg {
  data: string;
}
export interface IMsgScratchValueChanged extends IMsg {
  bank: string;
  value: string;
}
export interface IMsgReadRemoteRssi extends IMsg {
  rssi: number;
}
export interface IMsgDisconnected extends IMsg {
}
export interface IMsgError extends IMsg {
  code: string;
}

@Injectable()
export class BeanListener {
  public isListening: boolean = false;
  public isConnecting: boolean = false;

  public connectingTo: String = undefined;
  public mockMsg = 0;

  address: String = undefined;

  // msg connected
  hardwareVersion: string = undefined;
  firmwareVersion: string = undefined;
  sofwareVersion: string = undefined;

  // msg scratchValueChanged
  scratchBank: string[] = [
    null,
    null,
    null,
    null,
    null,
    null
  ]

  // serialMessageReceived
  lastMessageSerial: string = undefined;

  // error
  errorCode: any = undefined;

  // rssiReadRemote
  rssi: number = 0;

  // last type of message received
  lastMessageType: MsgTypeEnum = undefined;

  constructor(public events: Events) {

  }

  connect(addr: String) {

    if (this.isConnecting) {
      var err = new Error(BeanListenerEvent.WasConnecting);
      console.log(BeanListenerEvent.WasConnecting, err);
      self.events.publish(BeanListenerEvent.WasConnecting, err);
      return;
    }

    if (this.isListening) {
      var err = new Error(BeanListenerEvent.NotListening);
      console.log(BeanListenerEvent.NotListening, err);
      self.events.publish(BeanListenerEvent.NotListening, err);
    }

    var self = this;

    if (!PluginBean) {
      // mocking

      self.mockMsg = 0;
      self.isConnecting = true;
      self.connectingTo = addr;
      self.events.publish(BeanListenerEvent.Connecting);
      self.events.publish(BeanListenerEvent.ConnectChangeProbable);

      let timer = Observable.timer(250);
      timer.subscribe(t=> {

        self.address = addr;
        self.isListening = true;
        self.hardwareVersion = 'v2.1 bean+';
        self.firmwareVersion = 'v3.98488934';
        self.sofwareVersion = 'v12.42.33';

        self.lastMessageSerial = 'Serial Message Yo';
        self.scratchBank[2] = 'Scratch Message 2 Yo';

        self.connectingTo = undefined;
        self.isConnecting = false;

        console.log(BeanListenerEvent.MessageConnectSuccess + '(mocked)');
        self.events.publish(BeanListenerEvent.MessageConnectSuccess);
        self.events.publish(BeanListenerEvent.ConnectChangeProbable);
      });

    } else {

      self.isConnecting = true;
      self.connectingTo = addr;
      self.events.publish(BeanListenerEvent.Connecting);

      Cordova.exec(
        self.getCallback(),
        function(e) {
          self.connectingTo = undefined;
          self.isConnecting = false;
          self.isListening = false;
          console.log(BeanListenerEvent.ConnectError, e);
          self.events.publish(BeanListenerEvent.ConnectError, e);
          self.events.publish(BeanListenerEvent.ConnectChangeProbable);
        },
        'PTBeanPlugin',
        'connect',
        [ addr ]
      );
    };
  }

  disconnect() {
    var self = this;

    if (this.isConnecting) {
      var err = new Error(BeanListenerEvent.StillConnecting);
      console.log(BeanListenerEvent.StillConnecting, err);
      self.events.publish(BeanListenerEvent.StillConnecting, err);
    }

    if (!this.isListening) {
      var err = new Error(BeanListenerEvent.NotListening);
      console.log(BeanListenerEvent.NotListening, err);
      self.events.publish(BeanListenerEvent.NotListening, err);
    }

    self.connectingTo = undefined;
    self.isConnecting = false;

    if (!PluginBean) {
      // mocking
      Observable.timer(1000).subscribe(t=> {
        self.isListening = false;
        self.events.publish(BeanListenerEvent.DisconnectSuccess);
        self.events.publish(BeanListenerEvent.ConnectChangeProbable);
      });
    } else {
      Cordova.exec(
        function() {
          self.isListening = false;
          self.events.publish(BeanListenerEvent.DisconnectSuccess);
          self.events.publish(BeanListenerEvent.ConnectChangeProbable);
        },
        function(e) {
          self.isListening = false;
          console.log(BeanListenerEvent.DisconnectError, e);
          self.events.publish(BeanListenerEvent.DisconnectError, e);
          self.events.publish(BeanListenerEvent.ConnectChangeProbable);
        },
        'PTBeanPlugin',
        'disconnect',
        []
      );
    };
  }

  sendSerialData(msg: string, noeol?: boolean) {
    var self = this;
    var sending = msg;

    if (!noeol) {
      sending += '\n';
    }

    // should really promisify everything else too
    return new Promise<string>(function(resolve, reject) {

      if ((self.isConnecting) || (!self.isListening)) {
        var err = new Error(BeanListenerEvent.NotReady);
        console.log(BeanListenerEvent.NotReady, err);
        self.events.publish(BeanListenerEvent.NotReady, err);
        return reject(err);
      }

      if (!PluginBean) {
        self.mockMsg++;
        if (self.mockMsg > -1) {
          self.events.publish(BeanListenerEvent.SerialSuccess);
          return resolve(sending);
        } else {
          Observable.timer(250).subscribe(t=> {
            self.isListening = false;
            self.connectingTo = undefined;
            self.isConnecting = false;
          });

          var err = new Error(BeanListenerEvent.SerialError);
          console.log(BeanListenerEvent.SerialError, err);
          self.events.publish(BeanListenerEvent.SerialError, err);
          return reject(err);
        }
      } else {
        Cordova.exec(
          function() {
            self.events.publish(BeanListenerEvent.SerialSuccess);
            return resolve(sending);
          },
          function(e) {
            self.isListening = false;
            console.log(BeanListenerEvent.SerialError, e);
            self.events.publish(BeanListenerEvent.SerialError, e);
            return reject(new Error((e && e.message) || BeanListenerEvent.SerialError));
          },
          'PTBeanPlugin',
          'serial',
          [sending]
        );
      };
    });
  }

  // this is invoked repeatedly by bean message events
  getCallback() {
    var self = this;

    return function msgCallback(msg: IMsg) {
      //console.log('msg received', msg);

      if (msg && msg.type) {
        self.lastMessageType = msg.type;

        switch (msg.type) {
          case MsgType.Connected:
            let connMsg = <IMsgConnected>msg;
            self.address = self.connectingTo;
            self.isListening = true;
            self.isConnecting = false;

            self.hardwareVersion = connMsg.hardwareVersion;
            self.firmwareVersion = connMsg.firmwareVersion;
            self.sofwareVersion = connMsg.sofwareVersion;

            console.log(BeanListenerEvent.MessageConnectSuccess);
            self.events.publish(BeanListenerEvent.MessageConnectSuccess, msg);
            self.events.publish(BeanListenerEvent.ConnectChangeProbable);
            break;
          case MsgType.ConnectionFailed:
            self.isListening = false;
            self.isConnecting = false;
            self.connectingTo = undefined;
            console.log(BeanListenerEvent.MessageConnectFailed);
            self.events.publish(BeanListenerEvent.MessageConnectFailed, msg);
            self.events.publish(BeanListenerEvent.ConnectChangeProbable);
            break;
          case MsgType.SerialMessageReceived:
            let serMsg = <IMsgSerialMessageReceived>msg;
            self.lastMessageSerial = serMsg.data;
            //console.log(BeanListenerEvent.MessageSerial);
            self.events.publish(BeanListenerEvent.MessageSerial, msg);
            break;
          case MsgType.ScratchValueChanged:
            let svcMsg = <IMsgScratchValueChanged>msg;
            self.scratchBank[svcMsg.bank] = svcMsg.value;
            //console.log(BeanListenerEvent.MessageScratch);
            self.events.publish(BeanListenerEvent.MessageScratch, msg);
            break;
          case MsgType.RssiReadRemote:
            let rssiMsg = <IMsgReadRemoteRssi>msg;
            self.rssi = rssiMsg.rssi;
            //console.log(BeanListenerEvent.MessageRssi);
            self.events.publish(BeanListenerEvent.MessageRssi, msg);
            break;
          case MsgType.Disconnected:
            self.isListening = false;
            self.isConnecting = false;
            self.connectingTo = undefined;
            console.log(BeanListenerEvent.MessageDisconnected);
            self.events.publish(BeanListenerEvent.MessageDisconnected);
            self.events.publish(BeanListenerEvent.ConnectChangeProbable);
            break;
          case MsgType.Error:
            let error = <IMsgError>msg;
            self.errorCode = error.code;
            console.log(BeanListenerEvent.MessageError);
            self.events.publish(BeanListenerEvent.MessageError, msg);
            self.events.publish(BeanListenerEvent.ConnectChangeProbable);
            break;
          default:
            console.log(BeanListenerEvent.MessageUnknown);
            self.events.publish(BeanListenerEvent.MessageUnknown, msg);
            break;
        }
      }

      // generic catch all, called after property values are updated
      // intended mainly for view refresh (digest cycle / dirty checking)
      console.log(BeanListenerEvent.MessageAny);
      self.events.publish(BeanListenerEvent.MessageAny, msg);
    }
  }
}