// Portrait splash screens for iOS home screen web apps: [CSS width, CSS height, pixel ratio].
const DEVICES = [
  [440, 956, 3],
  [430, 932, 3],
  [428, 926, 3],
  [414, 896, 3],
  [414, 896, 2],
  [414, 736, 3],
  [402, 874, 3],
  [393, 852, 3],
  [390, 844, 3],
  [375, 812, 3],
  [375, 667, 2],
  [320, 568, 2],
  [1032, 1376, 2],
  [1024, 1366, 2],
  [834, 1210, 2],
  [834, 1194, 2],
  [834, 1112, 2],
  [820, 1180, 2],
  [810, 1080, 2],
  [768, 1024, 2],
  [744, 1133, 2],
] as const;

export const STARTUP_IMAGES = DEVICES.map(([width, height, ratio]) => ({
  url: `/splash/${width * ratio}x${height * ratio}.png`,
  media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
}));
