precision highp float;
precision highp sampler2D;

varying vec4 vPos;

void main(){
    vec4 color = vec4(1.0, vPos.y, vPos.z, 0.1);
    gl_FragColor = color;
}
