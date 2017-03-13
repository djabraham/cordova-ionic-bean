/* tslint:disable:no-unused-expression no-unused-variable */

import { Component, Input, Output, ElementRef, Renderer, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
import { DomController } from 'ionic-angular';
import { Observable, Subject } from 'rxjs/Rx';

import * as Utils from './utils';

interface IBoundingClientRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  height: number;
  width: number;
}

@Component({
  selector: 'control-pad',
  templateUrl: 'control-pad.html'
})
export class ControlPad implements OnChanges {

  // http://stackoverflow.com/a/39960980/1759357
  @Output("onPosition") onPosition: EventEmitter<Utils.I2dPoint> = new EventEmitter<Utils.I2dPoint>();

  // in ngAfterViewInit() a subscriber is setup to debounce change events
  positionChanged: Subject<Utils.I2dPoint> = new Subject<Utils.I2dPoint>();

  /** fired by control to update callback in implementors */
  // @Input() change: (coord: Utils.I2Cartesian, polar: Utils.I2dPolar) => void;

  @Input('shapeSquare') ShapeSquare;
  @Input('snapBack') SnapBack;
  @Input('sizeKnob') SizeKnob;
  @Input('sizeLimit') SizeLimit;
  @Input('changeMax') ChangeMax;

  // TODO: expose position through input
  //       listen for changes in ngOnChanges()
  //       update using queueChangePosition() so those bound to position are informed

  // needed getters for inputs, that were typed as strings at times
  get shapeSquare(): boolean {
    return Utils.coerceBoolValue(this.ShapeSquare, false);
  }
  get snapBack(): boolean {
    return Utils.coerceBoolValue(this.SnapBack, true);
  }
  get sizeKnob(): number {
    return Utils.coerceIntegerValue(this.SizeKnob, 48);
  }
  get sizeLimit(): number {
    return Utils.coerceIntegerValue(this.SizeLimit, 240);
  }
  get changeMax(): number {
    return Utils.coerceIntegerValue(this.ChangeMax, 2);
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
    center : [0, 0]
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
    digs: { x: '000', y: '000' },
    sign: { x: '+', y: '-' }
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
      this.positionChanged
        .debounceTime(this.changeMax)   // wait after the last event before emitting last event
        .distinctUntilChanged()         // only emit if value is different from previous value
        .subscribe(point => {
          // console.log('debounced: ', point);
          self.onPosition.emit( point );
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

    this.label.digs.x = Utils.getPoslabel(Math.abs(this.knob.coord[0]));
    this.label.digs.y = Utils.getPoslabel(Math.abs(this.knob.coord[1]));

    this.label.sign.x = (this.knob.coord[0] < 0) ? '-' : '+';
    this.label.sign.y = (this.knob.coord[1] < 0) ? '-' : '+';
  }

  knobRender() {
    this.domCtrl.write(() => {
      this.renderer.setElementStyle(this.elKnob, 'left', this.knob.pos[0] + 'px');
      this.renderer.setElementStyle(this.elKnob, 'top', this.knob.pos[1] + 'px');
    });

    var position = this.knob.coord; // Utils.roundArray(this.knob.coord);
    this.positionChanged.next({ x: position[0], y: position[1] });
  }

  controlReset() {
    this.elOuter = this.element.nativeElement;
    this.elStick = this.elOuter.querySelector('.stick');
    this.elLimit = this.elOuter.querySelector('.limit');
    this.elKnob = this.elOuter.querySelector('.knob');
    this.elLabelX = this.elOuter.querySelector('.xlabel');
    this.elLabelY = this.elOuter.querySelector('.ylabel');

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
    //   changeMax: this.changeMax
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
