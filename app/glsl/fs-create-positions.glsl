precision highp float;

varying vec3 vPos;

void main(){
    vec3 pos = vPos;
    gl_FragColor = vec4(pos, 1.0);
}
