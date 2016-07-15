#extension GL_OES_standard_derivatives : enable

precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 aV2I;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform sampler2D uPositionsTexture;

varying vec4 vPos;
varying vec2 vUv;

varying mat3 vNormalMatrix;
varying vec4 vOPosition;
varying vec3 vU;


  void main(){

      vec4 pos = texture2D( uPositionsTexture, aV2I );

      vPos = pos;
      vOPosition = modelViewMatrix * vPos;
      vU = normalize( vec3( modelViewMatrix * vPos ) );
      vNormalMatrix = normalMatrix;

      gl_Position = projectionMatrix * modelViewMatrix * vPos;


  }