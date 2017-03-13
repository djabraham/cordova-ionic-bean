
// Coords

export var rad45: number = 0.785398;  // 45 degrees in radians
export var rad90: number = 1.570800;  // 90 degrees in radians

// Converts from degrees to radians.
export function degToRad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
export function radToDeg(radians) {
  return radians * 180 / Math.PI;
};

/** round number to specific number of decimal places */
export function roundTo(n: number, places?: number) {
  if (places) {
    var precision = 10 * Math.floor(places || 1);

    if (precision > 0) {
      return (Math.round(n * precision) / precision);
    } else {
      var incursion = Math.abs(precision);
      return (Math.round(n / incursion) * incursion);
    }
  } else {
    return Math.round(n);
  }
}

/** returns new array with rounded values */
export function roundArray(a: number[], places?: number) {
  return [roundTo(a[0], places), roundTo(a[1], places)];
}

// https://gist.github.com/gre/1650294
// http://joshondesign.com/2013/03/01/improvedEasingEquations
export function easeOutQuart(t) {
  return 1 - (--t) * t * t * t;
}

/** converts strings to boolean, assigns default if null */
export function coerceBoolValue(str, def): boolean {
  if (str == null) {
    return !!((def == null) ? false : def);
  } else {
    return !!(((str === 'false') || (str === false)) ? false : ((str === 'true') || (str === true)));
  }
}

/** converts strings to integer, assigns default if null */
export function coerceIntegerValue(str, def): number {
  if (str == null) {
    return Math.round(def || 0);
  } else {
    return Math.round(parseInt(str) || def || 0);
  }
}

/**
 * Point
 * polar coordinate described by distance & angle(radians) from center of grid
 */
export class Point2dPolar extends Array<number> {
  constructor(d?: number, a?: number) {
    super();

    this.distance = d || 0;
    this.angle = a || 0;
  }

  get distance(): number {
    return this[0];
  }
  set distance(val: number) {
    this[0] = val;
  }

  get angle(): number {
    return this[0];
  }
  set angle(val: number) {
    this[0] = val;
  }

  toRounded(p: number): Point2dPolar {
    return new Point2dPolar(roundTo(this.distance, p), this.angle);
  }

  toCartesian(): Point2dCartesian {
    const x = Math.cos(this[1]) * this[0];
    const y = Math.sin(this[1]) * this[0];
    return new Point2dCartesian(x, y);
  }

  /** ensures point falls within circle, optionally forces to edge */
  toMaxCircle(radius: number, forceToEdge?: boolean): Point2dPolar {
    var adjDist = radius;
    if (!forceToEdge) {
      adjDist = ((this[0] > radius) ? radius : this[0]);
    }

    return new Point2dPolar(adjDist, this[1]);
  }

  /** ensures point falls within square, optionally forces to edge */
  toMaxSquare(size: number, onto?: boolean): Point2dPolar {

    // converting to 0/360 degree form, instead of 180/-180
    var fullArcAngle = (this[1] < 0) ? (this[1] + degToRad(360)) : this[1];

    // easiest way to avoid complex if/then/else nonsense is to
    // normalize angle so cosine is applicable to all 4 quadrants
    // http://stackoverflow.com/a/4788992/1759357
    var quadrantized = (((fullArcAngle + rad45) % rad90) - rad45);

    // calculating distance to edge of square along same polar vector
    // var centerToEdgeOfSquare = (1 / Math.cos(toRadians(quadrantized))) * size;
    var distFromCenterToEdge = (1 / Math.cos(quadrantized)) * size;

    // pulling point within square limits, if necessary
    var adjDist = distFromCenterToEdge;
    if (!onto) {
      adjDist = ((this[0] > distFromCenterToEdge) ? distFromCenterToEdge : this[0]);
    }

    return new Point2dPolar(adjDist, this[1]);
  }
}

/**
 * Point
 * cartesian coordinate described by x & y distance from center of grid
 */
export class Point2dCartesian extends Array<number> {
  constructor(x?: number, y?: number) {
    super();

    this.x = x || 0;
    this.y = y || 0;
  }

  get x(): number {
    return this[0];
  }
  set x(val: number) {
    this[0] = val;
  }

  get y(): number {
    return this[0];
  }
  set y(val: number) {
    this[0] = val;
  }

  toRounded(p: number): Point2dCartesian {
    return new Point2dCartesian(
      roundTo(this.x, p),
      roundTo(this.y, p)
    )
  }

  toPolar(): Point2dPolar {
    var dist = Math.sqrt((this[0] * this[0]) + (this[1] * this[1]));
    var rads = Math.atan2(this[1], this[0]);
    return new Point2dPolar(dist, rads);
  }

  /** returns point based on offset into dom view (upper left) */
  toViewBox(view: viewBox2d): Point2dCartesian {
    return new Point2dCartesian (
      this[0] + view.center[0],
      (this[1] * (-1)) + view.center[1]      // note that y-axis is inverted
    );
  }

  /** returns point based on local coords at center of a view */
  toLocal(view: viewBox2d): Point2dCartesian {
    return new Point2dCartesian (
      (this[0] - view.center[0]),
      (this[1] - view.center[1]) * (-1)     // note that y-axis is inverted
    );
  }

  /** projects a cartesian coordinate into a circle of given size */
  toMaxCircle(radius: number, forceToEdge?: boolean): Point2dCartesian {
    return this.toPolar().toMaxCircle(radius, forceToEdge).toCartesian();
  }

  /** projects a cartesian coordinate into a circle of given size */
  coordToMaxSquare(size: number, forceToEdge?: boolean): Point2dCartesian {
    return this.toPolar().toMaxSquare(size, forceToEdge).toCartesian();
  }
}

export class viewBox2d {
  size: Point2dCartesian;
  center: Point2dCartesian;

  constructor(x?: number, y?: number) {
    this.size.x = x || 0;
    this.size.y = y || 0;

    this.center.x = Math.round(this.size.x / 2) || 0;
    this.center.y = Math.round(this.size.y / 2) || 0;
  }
};
