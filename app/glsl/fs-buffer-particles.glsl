precision highp float;
precision highp sampler2D;

uniform sampler2D textureMap;
uniform vec3 colorParticle;
uniform float uLifeTime;
varying vec4 vColor;

void main(){

    vec4 color = texture2D(textureMap, gl_PointCoord);
    float alpha = vColor.a / uLifeTime;

    if( vColor.a == uLifeTime ) alpha = 0.0;

    gl_FragColor = vec4( colorParticle, alpha );
}