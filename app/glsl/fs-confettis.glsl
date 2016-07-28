precision highp float;

uniform sampler2D map;

varying float vRotation;
varying vec3 vColor;

void main(void) {
  // see https://github.com/mrdoob/three.js/issues/1891
  float mid = 0.5;

  vec2 rotated = vec2(
    cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid,
    cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid
  );

  gl_FragColor = texture2D(map, rotated);
  gl_FragColor.rgb *= vColor;
}
