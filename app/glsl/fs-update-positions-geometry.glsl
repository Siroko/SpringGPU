precision highp float;
precision highp sampler2D;

uniform sampler2D uPrevPositions;
uniform sampler2D uSpringTexture;
varying vec2 vUv;

void main () {

    vec2 uv = vUv;

    vec4 prevPositions = texture2D( uPrevPositions, uv );
    vec4 springPosition = texture2D( uSpringTexture, uv );

    vec3 pos =  prevPositions.xyz - springPosition.xyz;

    gl_FragColor = vec4( pos, 1.0 );

}
