
// http://blog.crondesign.com/2011/02/actionscriptjavascript-colour-mode.html

export function hex2rgb(hex: number): Array<number> {
  var rgb: Array<number> = new Array<number>();
  rgb[0] = hex >> 16;
  rgb[1] = hex >> 8 & 0xFF;
  rgb[2] = hex & 0xFF;
  return rgb;
}

export function rgb2hex(rgb: Array<number>): number {
  var hex = rgb[0] << 16 | rgb[1] << 8 | rgb[2];
  return hex;
}

export function hex2str6(hex: number): string {
  if (hex <= 0xFFFFFF) {
    return ('000000' + Math.round(hex).toString(16)).slice(-6);
  } else {
    return ('' + Math.round(hex).toString(16));
  }
}

export function hex2str2(hex: number): string {
  if (hex <= 0xFF) {
    return ('00' + Math.round(hex).toString(16)).slice(-2);
  } else {
    return ('' + Math.round(hex).toString(16));
  }
}

export function hsb2rgb(inp: Array<number>): Array<number> {
  var red, grn, blu, i, f, p, q, t;

  var hsb = [ inp[0], inp[1], inp[2] ];
  hsb[0] %= 360;
  if (hsb[2] == 0) { return [0, 0, 0]; }
  hsb[1] /= 100;
  hsb[2] /= 100;
  hsb[0] /= 60;
  i = Math.floor(hsb[0]);
  f = hsb[0] - i;
  p = hsb[2] * (1 - hsb[1]);
  q = hsb[2] * (1 - (hsb[1] * f));
  t = hsb[2] * (1 - (hsb[1] * (1 - f)));
  if (i == 0) { red = hsb[2]; grn = t; blu = p; }
  else if (i == 1) { red = q; grn = hsb[2]; blu = p; }
  else if (i == 2) { red = p; grn = hsb[2]; blu = t; }
  else if (i == 3) { red = p; grn = q; blu = hsb[2]; }
  else if (i == 4) { red = t; grn = p; blu = hsb[2]; }
  else if (i == 5) { red = hsb[2]; grn = p; blu = q; }
  red = Math.min(Math.floor(red * 255), 255);
  grn = Math.min(Math.floor(grn * 255), 255);
  blu = Math.min(Math.floor(blu * 255), 255);
  return ([red, grn, blu]);
}

export function rgb2hsb(inp: Array<number>): Array<number> {
  var x, f, i, hue, sat, bri;

  var rgb = [ inp[0], inp[1], inp[2] ];
  rgb[0] /= 255;
  rgb[1] /= 255;
  rgb[2] /= 255;
  x = Math.min(Math.min(rgb[0], rgb[1]), rgb[2]);
  bri = Math.max(Math.max(rgb[0], rgb[1]), rgb[2]);
  if (x == bri) {
    return (new Array<number>(undefined, 0, bri * 100));
  }
  f = (rgb[0] == x) ? rgb[1] - rgb[2] : ((rgb[1] == x) ? rgb[2] - rgb[0] : rgb[0] - rgb[1]);
  i = (rgb[0] == x) ? 3 : ((rgb[1] == x) ? 5 : 1);
  hue = Math.floor((i - f / (bri - x)) * 60) % 360;
  sat = Math.floor(((bri - x) / bri) * 100);
  bri = Math.floor(bri * 100);
  return ([hue, sat, bri]);
}

export function hsb2hex(hsb: Array<number>): number {
  var rgb = hsb2rgb(hsb);
  return (rgb2hex(rgb));
}

export function hex2hsb(hex: number): Array<number> {
  var rgb = hex2rgb(hex);
  return (rgb2hsb(rgb));
}

// flash only export function: I dont have an inverse for this. maybe someone could post one in the comments?
export function hex2matrix(hex: number, alpha: number) {
  var matrix: Array<number> = [];
  matrix = matrix.concat([((hex & 0x00FF0000) >>> 16) / 255, 0, 0, 0, 0]);// red
  matrix = matrix.concat([0, ((hex & 0x0000FF00) >>> 8) / 255, 0, 0, 0]); //green
  matrix = matrix.concat([0, 0, (hex & 0x000000FF) / 255, 0, 0]); // blue
  matrix = matrix.concat([0, 0, 0, (alpha/100), 0]); // alpha
  return matrix;
}

//Converts to color HSB object (code from here http://www.csgnetwork.com/csgcolorsel4.html with some improvements)
// function rgb2hsb(r, g, b) {
//   r /= 255; g /= 255; b /= 255; // Scale to unity.
//   var minVal = Math.min(r, g, b),
//     maxVal = Math.max(r, g, b),
//     delta = maxVal - minVal,
//     HSB = { hue: 0, sat: 0, bri: maxVal },
//     del_R, del_G, del_B;

//   if (delta !== 0) {
//     HSB.sat = delta / maxVal;
//     del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
//     del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
//     del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

//     if (r === maxVal) { HSB.hue = del_B - del_G; }
//     else if (g === maxVal) { HSB.hue = (1 / 3) + del_R - del_B; }
//     else if (b === maxVal) { HSB.hue = (2 / 3) + del_G - del_R; }

//     if (HSB.hue < 0) { HSB.hue += 1; }
//     if (HSB.hue > 1) { HSB.hue -= 1; }
//   }

//   HSB.hue *= 360;
//   HSB.sat *= 100;
//   HSB.bri *= 100;

//   return HSB;
// }

// https://github.com/jankuca/hsb2rgb
// function hsb2rgb(hue, saturation, brightness) {
//   hue = (parseInt(hue, 10) || 0) % 360;

//   saturation = /%/.test(saturation)
//     ? parseInt(saturation, 10) / 100
//     : parseFloat(saturation, 10);

//   brightness = /%/.test(brightness)
//     ? parseInt(brightness, 10) / 100
//     : parseFloat(brightness, 10);

//   saturation = Math.max(0, Math.min(saturation, 1));
//   brightness = Math.max(0, Math.min(brightness, 1));

//   var rgb;
//   if (saturation === 0) {
//     return [
//       Math.round(255 * brightness),
//       Math.round(255 * brightness),
//       Math.round(255 * brightness)
//     ];
//   }

//   var side = hue / 60;
//   var chroma = brightness * saturation;
//   var x = chroma * (1 - Math.abs(side % 2 - 1));
//   var match = brightness - chroma;

//   switch (Math.floor(side)) {
//   case 0: rgb = [ chroma, x, 0 ]; break;
//   case 1: rgb = [ x, chroma, 0 ]; break;
//   case 2: rgb = [ 0, chroma, x ]; break;
//   case 3: rgb = [ 0, x, chroma ]; break;
//   case 4: rgb = [ x, 0, chroma ]; break;
//   case 5: rgb = [ chroma, 0, x ]; break;
//   default: rgb = [ 0, 0, 0 ];
//   }

//   rgb[0] = Math.round(255 * (rgb[0] + match));
//   rgb[1] = Math.round(255 * (rgb[1] + match));
//   rgb[2] = Math.round(255 * (rgb[2] + match));

//   return rgb;
// }
