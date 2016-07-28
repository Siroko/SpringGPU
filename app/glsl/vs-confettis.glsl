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

attribute float rotation;
attribute float scale;
attribute vec3 color;

uniform float size;

varying vec3 vColor;
varying float vRotation;

void main(void) {
  vColor = color;
  vRotation = rotation;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_PointSize = size * (scale / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
