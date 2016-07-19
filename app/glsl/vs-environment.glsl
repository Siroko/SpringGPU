precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform sampler2D map;
uniform sampler2D uPatternMap;

varying vec4 vPos;
varying vec2 vUv;

void main() {

    vUv = uv;
    vPos = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vPos;
}