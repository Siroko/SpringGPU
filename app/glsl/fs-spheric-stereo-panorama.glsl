precision highp float;
precision highp sampler2D;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float offsetEye;
uniform vec2 angle;

varying vec2 vUv;
varying vec4 vPos;

void main(){

    vec2 texCoords = vec2(vUv.x, vUv.y * 0.5 + offsetEye);


    vec4 color1 = texture2D( texture1, texCoords );
    vec4 color2 = texture2D( texture2, texCoords );

    float d = distance( angle, texCoords );
    vec4 color = color1;

    if( vUv.x < angle.x ){
        color = color2;
    }

    gl_FragColor = color;
}
