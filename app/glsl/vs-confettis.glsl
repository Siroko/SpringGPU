// builtins
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// custom
attribute float scale;
attribute vec2 offset;
attribute vec3 color;

uniform float size;

varying vec3 vColor;
varying vec2 vOffset;

void main(void) {
  vColor = color;
  vOffset = offset;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_PointSize = size * (scale / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
