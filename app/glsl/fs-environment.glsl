#extension GL_OES_standard_derivatives : enable

precision highp float;
precision highp sampler2D;

uniform sampler2D uPatternMap;
uniform sampler2D map;

varying vec4 vPos;
varying vec2 vUv;

void main(){

    vec4 ao = texture2D( map, vUv );
    vec4 patt = texture2D( uPatternMap, vUv * 10.0 );

    vec4 color = ao * patt;

    gl_FragColor = color;
}
