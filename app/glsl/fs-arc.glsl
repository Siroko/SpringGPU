precision highp float;
precision highp sampler2D;

uniform vec4 color;
uniform vec4 colorInside;
uniform float progress;
uniform float alpha;

varying vec2 vUv;

void main() {

    // set pi
    float pi = 3.141592653589793238462643383279;
    // set transparent color
    vec4 cBlack = vec4(0.0, 0.0, 0.0, 0.0);
    // set base color
    vec4 c = vec4(0.0);

    //determine center position
    vec2 position = vUv - vec2(0.5);
    //determine the vector length of the center position
    float len = length(position);
    // calculate the angle of the texel to the center
    float angle = atan(position.y, position.x);
    // get the progress angle in radians
    float progressRadians = ( ( 0.5 - (1.0 - progress) ) ) * ( pi * 2.0 );

    if( len < 0.25 && len > 0.20 && angle < progressRadians ) {
        c =  vec4( color.rgb, alpha );
    } else {
        if( len < 0.15 && colorInside.a > 0.0 ) {
          
            c = vec4( colorInside.rgb, alpha );

        } else {
            c = cBlack;
        }
    }

    gl_FragColor = c;
}