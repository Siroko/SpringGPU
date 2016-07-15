precision highp float;

uniform sampler2D map;

varying vec2 vUV;

void main() {

	vec4 c = texture2D( map, vUV ).rgba;

	gl_FragColor = vec4( c.rgb * vec3( 1., 1., 1. ), c.a );
	//gl_FragColor = vec4( 1., 0., 1., 1. );

}