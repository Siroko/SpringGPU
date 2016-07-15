precision highp float;
precision highp sampler2D;

attribute vec2 aV2I;

uniform float uGeomToDraw;

varying vec3 vPos;

void main() {

    vec4 gridPos = vec4(2.0 * aV2I - vec2(1.0), 0.0, 1.0);

    if( uGeomToDraw == 0.0 ) vPos = gridPos.rgb;
    if( uGeomToDraw == 1.0 ) vPos = position;

    gl_PointSize = 1.0;
    gl_Position = gridPos;
}
