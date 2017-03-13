
// Utilities

// Could use some vast improvement
// Point should be first class and functions should be chainable
// See WIP coords.tx

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
  return [ roundTo(a[0], places), roundTo(a[1], places) ];
}

/** float issues make negative 0 possibile */
export function fixZero(number) {
	return (number === 0 && (1 / number) === -Infinity) ? 0.0 : number;
};

/** converts strings to boolean, assigns default if null */
export function coerceBoolValue(str, def) : boolean {
  if (str == null) {
    return !!((def == null) ? false : def);
  } else {
    return !!(((str === 'false') || (str === false)) ? false : ((str === 'true') || (str === true)));
  }
}

/** converts strings to integer, assigns default if null */
export function coerceIntegerValue(str, def) : number {
  if (str == null) {
    return Math.round(def || 0);
  } else {
    return Math.round(parseInt(str) || def || 0);
  }
}

export function getPoslabel(number): string {
  if (number <= 999) {
    return ('000' + Math.round(number)).slice(-3);
  } else {
    return ('' + Math.round(number));
  }
}

// https://gist.github.com/gre/1650294
// http://joshondesign.com/2013/03/01/improvedEasingEquations
export function easeOutQuart(t) {
  return 1-(--t)*t*t*t;
  // var p = 0.3;
  // return Math.pow(2, -10 * t) * Math.sin((t - p/4) * (2 * Math.PI) / p) + 1;
}

// Converts from degrees to radians.
export function degToRad (degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
export function radToDeg (radians) {
  return radians * 180 / Math.PI;
};

export interface I2Cartesian extends Array<number> {};
export interface I2dPolar extends Array<number> {};

export interface I2dPoint {
  x: number;
  y: number;
};

export interface I2dView {
  size: I2Cartesian;
  center: I2Cartesian;
};

/** cartesian coordinate to polar dist and angle */
export function coordToPolar (coord: I2Cartesian) {
  var dist = Math.sqrt((coord[0] * coord[0]) + (coord[1] * coord[1]));
  var rads = Math.atan2(coord[1], coord[0]);
  // var degs = toDegrees(rads);
  return [dist, rads];
}

/** cartesian coordinate from polar dist and angle */
export function coordFromPolar (polar: I2dPolar) {
  // var rads = toRadians(polar[1]);
  const x = Math.cos(polar[1]) * polar[0];
  const y = Math.sin(polar[1]) * polar[0];
  return  [x, y];
}

/** cartesian coordinate to offset in dom units */
export function transCoordToOffset (p: I2Cartesian, v: I2dView) {
  // note that y-axis is inverted
  return [(p[0] + v.center[0]), fixZero((p[1] * (-1)) + v.center[1])]
}

/** offset in dom units to cartesian coordinate */
export function transOffsetToCoord (p: I2Cartesian, v: I2dView) {
  // note that y-axis is inverted
  return [ (p[0] - v.center[0]), fixZero((p[1] - v.center[1]) * (-1)) ]
}

/** projects a polar coordinate into OR onto a circle of given size */
export function polarToMaxCircle (polar: I2dPolar, size: number, onto?: boolean): I2dPolar {

  // pulls point into circle limits, which is easy since it's polar to circle
  var adjDist = size;
  if (!onto) {
    adjDist = ((polar[0] > size) ? size : polar[0]);
  }

  return [ adjDist, polar[1] ];
}

/** projects a polar coordinate into OR onto a square of given size */
export function polarToMaxSquare (polar: I2dPolar, size: number, onto?: boolean): I2dPolar {

  // converting to 0/360 degree form, instead of 180/-180
  var fullCircleAngle = (polar[1] < 0) ? (polar[1] + degToRad(360)) : polar[1];

  // easiest way to avoid complex if/then/else nonsense is to
  // normalize angle so cosine is applicable to all 4 quadrants
  // http://stackoverflow.com/a/4788992/1759357
  var quadrantized = (((fullCircleAngle + rad45) % rad90) - rad45);

  // calculating distance to edge of square along same polar vector
  // var centerToEdgeOfSquare = (1 / Math.cos(toRadians(quadrantized))) * size;
  var distFromCenterToEdge = (1 / Math.cos(quadrantized)) * size;

  // pulling point within square limits, if necessary
  var adjDistAlongPolarVector = distFromCenterToEdge;
  if (!onto) {
    adjDistAlongPolarVector = ((polar[0] > distFromCenterToEdge) ? distFromCenterToEdge : polar[0]);
  }

  return [ adjDistAlongPolarVector, polar[1] ];
}

/** projects a cartesian coordinate into a circle of given size */
export function coordToMaxCircle (coord: I2Cartesian, size: number) {
  /** this type of projection should occur along the polar vector */
  return coordFromPolar(polarToMaxCircle(coordToPolar(coord), size));
}

/** projects a cartesian coordinate into a square of given size */
export function coordToMaxSquare (coord: I2Cartesian, size: number) {
  /** this type of projection should occur along the polar vector */
  return coordFromPolar(polarToMaxSquare(coordToPolar(coord), size));
}

export var rad45: number = 0.785398;  // 45 degrees in radians
export var rad90: number = 1.570800;  // 90 degrees in radians

