precision highp float;
precision highp sampler2D;

uniform highp sampler2D textureMap;

varying vec2 vUv;

void main(){
    vec4 color = texture2D(textureMap, vUv);
    gl_FragColor = color;
}