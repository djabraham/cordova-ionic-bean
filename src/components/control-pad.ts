/* tslint:disable:no-unused-expression no-unused-variable */

import { Component, Input, Output, ElementRef, Renderer, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
import { DomController } from 'ionic-angular';
import { Observable, Subject } from 'rxjs/Rx';

import * as Utils from './utils';
import * as Colors from './colors';

interface IBoundingClientRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  height: number;
  width: number;
}

interface IColorRGB {
  r: string;
  g: string;
  b: string;
}

interface IChangeValue {
  pos: Utils.I2dPoint;
  rgb: IColorRGB,
  hex: string
}

@Component({
  selector: 'control-pad',
  templateUrl: 'control-pad.html'
})
export class ControlPad implements OnChanges {

  // http://stackoverflow.com/a/39960980/1759357
  @Output("onChange") onChange: EventEmitter<IChangeValue> = new EventEmitter<IChangeValue>();

  // in ngAfterViewInit() a subscriber is setup to debounce change events
  posChanged: Subject<IChangeValue> = new Subject<IChangeValue>();

  /** fired by control to update callback in implementors */
  // @Input() change: (coord: Utils.I2Cartesian, polar: Utils.I2dPolar) => void;

  @Input('snapBack') SnapBack;
  @Input('shapeSquare') ShapeSquare;
  @Input('shapeColored') ShapeColored;
  @Input('sizeKnob') SizeKnob;
  @Input('sizeLimit') SizeLimit;
  @Input('rateThrottle') RateThrottle;

  // TODO: expose position through input
  //       listen for changes in ngOnChanges()
  //       update using queueChangePosition() so those bound to position are informed

  // needed getters for inputs, that were typed as strings at times
  get snapBack(): boolean {
    return Utils.coerceBoolValue(this.SnapBack, true);
  }
  get shapeSquare(): boolean {
    return Utils.coerceBoolValue(this.ShapeSquare, false);
  }
  get shapeColored(): boolean {
    return Utils.coerceBoolValue(this.ShapeColored, false);
  }
  get sizeKnob(): number {
    return Utils.coerceIntegerValue(this.SizeKnob, 48);
  }
  get sizeLimit(): number {
    return Utils.coerceIntegerValue(this.SizeLimit, 240);
  }
  get rateThrottle(): number {
    return Utils.coerceIntegerValue(this.RateThrottle, 2);
  }

  // TODO: expose snapBackInterval and snapBackStepsMax?
  snapBackInterval = 10;
  snapBackStepsMax = 10
  sizeMargin = 20;

  elOuter = undefined;
  elStick = undefined;
  elLimit = undefined;
  elKnob = undefined;
  elLabelX = undefined;
  elLabelY = undefined;

  finger = {
    pos    : [0, 0],
    init   : [0, 0],
    offset : [0, 0]  // total offset from start pos
  };

  limit = {
    size   : [0, 0],
    center : [0, 0],
    isColored: true
  };

  knob = {
    pos    : [0, 0],
    prev   : [0, 0],
    init   : [0, 0],
    size   : [0, 0],
    coord  : [0, 0],  // cartesian
    offset : [0, 0],
    center : [0, 0]
  };

  label = {
    posa: { x: '000', y: '000' },   // absolute value string, for screen purposes
    sign: { x: '+', y: '-' },
    color: {
      rgb: {
        r: '000', g: '000', b: '000'
      },
      hex: '#000000'
    }
  }

  constructor(public element: ElementRef, public renderer: Renderer, public domCtrl: DomController) { }

  /** fired when implementors change a bound input value */
	ngOnChanges(changes: { [ propName: string]: SimpleChange }) {
		console.log('Change detected in ControlPad Input, firing reset:', Object.keys(changes));
    this.controlReset();
    this.knobRender();
	}

  ngAfterViewInit() {
    let timer = Observable.timer(500);

    var self = this;

    // elements will shift as ionic dynamically updates, so activity is delayed by timer
    timer.subscribe(t=> {

      // this debounces the changes, to allieviate back-pressure on implementors
      this.posChanged
        .debounceTime(this.rateThrottle)   // wait after the last event before emitting last event
        .distinctUntilChanged()         // only emit if value is different from previous value
        .subscribe(point => {
          // console.log('debounced: ', point);
          self.onChange.emit( point );
        });

      let hammer = new window['Hammer'](this.elKnob);
      hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL, threshold: 2 });

      hammer.on('panmove panstart panend', (ev) => {
        this.handlePan(ev);
      });

      this.renderer.setElementStyle(this.elStick, 'opacity', '1.0');

      this.controlReset();
      this.knobRender();
    });
  }

  offsetToLimits (offset: Utils.I2Cartesian) {
    var coord = Utils.transOffsetToCoord(offset, this.limit);

    var limited = undefined;
    if (this.shapeSquare) {
      limited = Utils.coordToMaxSquare(coord, this.limit.center[0]);
    } else {
      limited = Utils.coordToMaxCircle(coord, this.limit.center[0]);
    }

    // cartesian to display offset
    return Utils.transCoordToOffset(limited, this.limit);
  }

  knobOffsetApply (offset: Utils.I2Cartesian) {
    var roundOffset = Utils.roundArray(offset, 8);
    this.knob.offset[0] = roundOffset[0];
    this.knob.offset[1] = roundOffset[1];
    this.knob.pos[0] = roundOffset[0] - this.knob.center[0];
    this.knob.pos[1] = roundOffset[1] - this.knob.center[1];

    var coord = Utils.transOffsetToCoord(roundOffset, this.limit);
    this.knob.coord[0] = coord[0];
    this.knob.coord[1] = coord[1];

    this.label.posa.x = Utils.padToThreeDecimal(Math.abs(this.knob.coord[0]));
    this.label.posa.y = Utils.padToThreeDecimal(Math.abs(this.knob.coord[1]));

    this.label.sign.x = (this.knob.coord[0] < 0) ? '-' : '+';
    this.label.sign.y = (this.knob.coord[1] < 0) ? '-' : '+';

    var bfactor = Math.round(255 * (this.knob.coord[1] / this.limit.center[1]));
    // var bfactor = Math.round(255 - (yfactor * 255));

    var xfactor = this.knob.offset[0] / this.limit.size[0];
    var xcolor = Math.floor(xfactor * 254);

    var cr = 0;
    var cg = 0;
    var cb = 0;

    // ff00ff  ff0000  ffff00  00ff00  00ffff  0000ff  ff00ff
    //    |   0   |   1   |   2   |   3   |   4   |   5   |
    //

    var zone = Math.floor(xcolor / 42.5);
    zone = (zone > 5) ? 5 : zone;

    var zoneRL = (42.5 - (xcolor % 42.5)) / 42.5;
    var zoneLR = (xcolor % 42.5) / 42.5;

    if (zone === 0) {
      cb = Math.round(255 * zoneRL);
      cr = Math.round(255);
    }
    if (zone === 1) {
      cr = Math.round(255);
      cg = Math.round(255 * zoneLR);
    }
    if (zone === 2) {
      cr = Math.round(255 * zoneRL);
      cg = Math.round(255);
    }
    if (zone === 3) {
      cg = Math.round(255);
      cb = Math.round(255 * zoneLR);
    }
    if (zone === 4) {
      cg = Math.round(255 * zoneRL);
      cb = Math.round(255);
    }
    if (zone === 5) {
      cb = Math.round(255);
      cr = Math.round(255 * zoneLR);
    }

    console.log({
      bfactor: bfactor,
      xfactor: xfactor,
      xcolor: xcolor,
      // zone: zone,
      // zoneLR: zoneLR,
      // zoneRL: zoneRL
    });

    var fr = Math.max(Math.min(cr + bfactor, 255), 0);
    var fg = Math.max(Math.min(cg + bfactor, 255), 0);
    var fb = Math.max(Math.min(cb + bfactor, 255), 0);

    this.label.color.rgb.r = Utils.padToThreeDecimal(fr);
    this.label.color.rgb.g = Utils.padToThreeDecimal(fg);
    this.label.color.rgb.b = Utils.padToThreeDecimal(fb);

    this.label.color.hex = Colors.hex2str6(Colors.rgb2hex([fr, fg, fb]));

    console.log('R:' + cr + ' G:' + cg + ' B:' + cb );
    console.log('R:' + fr + ' G:' + fg + ' B:' + fb );
    console.log(this.label.color.hex);

  }

  knobRender() {
    this.domCtrl.write(() => {
      this.renderer.setElementStyle(this.elKnob, 'left', this.knob.pos[0] + 'px');
      this.renderer.setElementStyle(this.elKnob, 'top', this.knob.pos[1] + 'px');
    });

    var position = this.knob.coord; // Utils.roundArray(this.knob.coord);
    this.posChanged.next({
      pos: { x: position[0], y: position[1] },
      rgb: this.label.color.rgb,
      hex: this.label.color.hex
    });
  }

  controlReset() {
    this.elOuter = this.element.nativeElement;
    this.elStick = this.elOuter.querySelector('.stick');
    this.elLimit = this.elOuter.querySelector('.limit');
    this.elKnob = this.elOuter.querySelector('.knob');
    this.elLabelX = this.elOuter.querySelector('.xlabel');
    this.elLabelY = this.elOuter.querySelector('.ylabel');

    this.limit.isColored = this.shapeColored;

    // limit's dimensions
    this.limit.size[0] = this.sizeLimit;
    this.limit.size[1] = this.sizeLimit;
    this.limit.center[0] = (this.limit.size[0] / 2);
    this.limit.center[1] = (this.limit.size[1] / 2);

    // knob's dimensions
    this.knob.size[0] = this.sizeKnob;
    this.knob.size[1] = this.sizeKnob;
    this.knob.center[0] = this.knob.size[0] / 2;
    this.knob.center[1] = this.knob.size[1] / 2;

    // knob's offset (center) and position (upper left dom px)
    this.knob.offset[0] = this.limit.center[0];
    this.knob.offset[1] = this.limit.center[1];

    this.renderer.setElementStyle(this.elOuter.querySelector('.horz'), 'top', ((this.limit.size[1] / 2) - 1) + 'px');
    this.renderer.setElementStyle(this.elOuter.querySelector('.vert'), 'left', ((this.limit.size[0] / 2) - 1) + 'px');

    if (this.shapeSquare) {
      this.renderer.setElementStyle(this.elLimit, 'border-radius', '0');
      this.renderer.setElementStyle(this.elStick, 'border-radius', this.sizeMargin + 'px');
    } else {
      this.renderer.setElementStyle(this.elLimit, 'border-radius', '50%');
      this.renderer.setElementStyle(this.elStick, 'border-radius', '50%');
    }

    this.renderer.setElementStyle(this.elStick, 'width', (this.limit.size[0] + (2 * this.sizeMargin) + 2) + 'px');
    this.renderer.setElementStyle(this.elStick, 'height', (this.limit.size[1] + (2 * this.sizeMargin) + 2) + 'px');

    this.renderer.setElementStyle(this.elLimit, 'min-width', (this.limit.size[0] + 2) + 'px');
    this.renderer.setElementStyle(this.elLimit, 'min-height', (this.limit.size[1] + 2) + 'px');

    this.renderer.setElementStyle(this.elKnob, 'width', this.knob.size[0] + 'px');
    this.renderer.setElementStyle(this.elKnob, 'height', this.knob.size[1] + 'px');

    this.renderer.setElementStyle(this.elLabelX, 'left', '-34px');
    this.renderer.setElementStyle(this.elLabelX, 'top', (this.limit.center[1] - 7) + 'px');

    this.renderer.setElementStyle(this.elLabelY, 'top', '-17px');
    this.renderer.setElementStyle(this.elLabelY, 'left', (this.limit.center[0] - 28) + 'px');

    // this.renderer.setElementStyle(this.elLabelY, 'height', this.knob.size[1] + 'px');

    this.knobOffsetApply(this.knob.offset);

    // console.log({
    //   shapeSquare: this.shapeSquare,
    //   snapBack: this.snapBack,
    //   sizeKnob: this.sizeKnob,
    //   sizeLimit: this.snapBack,
    //   rateThrottle: this.rateThrottle
    // });
  }

  /** returns the knob to the center position */
  knobSnapBack() {
    var self = this;

    // yields distance of current offset point from center
    var polarCoord = Utils.coordToPolar(Utils.transOffsetToCoord(self.knob.offset, this.limit));

    // yields max possible distance to edge along vector of current offset point
    var polarOnEdge = undefined;
    if (this.shapeSquare) {
      polarOnEdge = Utils.polarToMaxSquare(polarCoord, this.limit.center[0], true);
    } else {
      polarOnEdge = Utils.polarToMaxCircle(polarCoord, this.limit.center[0], true);
    }

    // dist/max = percentage of max that knob has to travel in order to return to center
    var travelFactor = (polarCoord[0] / polarOnEdge[0]);

    // if distance is relatively small, too many steps would be overkill
    // travel factor and max steps determines number of applied steps ( 1 < steps < max )
    var snapBackStepsTake = Math.floor(travelFactor * (this.snapBackStepsMax - 1));
    if (snapBackStepsTake < 3) {
      snapBackStepsTake = 3;
    }

    // distance back to center along each axis
    var toCenter = [
      (self.limit.center[0] - self.knob.offset[0]),
      (self.limit.center[1] - self.knob.offset[1])
    ]

    // knob offset at beginning of snap
    var offsetBeg = [
      self.knob.offset[0],
      self.knob.offset[1]
    ];

    // timer returns the knob to center
    Observable.interval(this.snapBackInterval)
      .take(snapBackStepsTake)
      .map((x) => x)
      .subscribe((x) => {

        // to prevent minor innacuracies default is final point (dead center)
        var newoffset = [ self.limit.center[0], self.limit.center[1] ];

        // skipping last step so default is used
        if (x !== (snapBackStepsTake - 1)) {
          var t = (x + 1) / snapBackStepsTake;

          // calculates a point using an easing function
          var ease = Utils.easeOutQuart(t);

          newoffset[0] = offsetBeg[0] + (toCenter[0] * ease);
          newoffset[1] = offsetBeg[1] + (toCenter[1] * ease);
        }

        self.knobOffsetApply(newoffset);
        self.knobRender();
      });
  }

  handlePan(ev) {
    if (ev.type =='panend') {
      if (Utils.coerceBoolValue(this.snapBack, true)) {
        this.knobSnapBack();
      }
    }

    if (ev.type =='panstart') {
      this.knob.init[0] = this.knob.offset[0];
      this.knob.init[1] = this.knob.offset[1];

      this.finger.offset[0] = 0;
      this.finger.offset[1] = 0;
      this.finger.init[0] = ev.center.x;
      this.finger.init[1] = ev.center.y;
    }

    if (ev.type =='panmove') {
      this.finger.offset[0] = (ev.center.x - this.finger.init[0]);
      this.finger.offset[1] = (ev.center.y - this.finger.init[1]);

      this.knobOffsetApply(
        this.offsetToLimits([
          this.knob.init[0] + this.finger.offset[0],
          this.knob.init[1] + this.finger.offset[1]
        ])
      );

      this.knobRender();
    }

  }

}
