#define MAX 32

precision highp float;

attribute vec3 position;
attribute float id;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform int string[ MAX ];
uniform float widths[ MAX ];
uniform float lefts[ MAX ];

uniform vec3 dimensions;

varying vec2 vUV;

void main() {

	int iid = int( id );
	float offset = 0.;
	vec3 p = position;
	for( int i = 0; i < MAX; ++i ){
		if( i < iid ) {
			p.x += widths[ i ] + offset;
		}
	}
	if( position.x == 1. ) {
		p.x += widths[ iid ] - 1.;
	}
	p.y = 1. - p.y;

	vUV = position.xy;
	float h = dimensions.z / dimensions.y;
	float c = float( string[ iid ] );
	if( vUV.y == 0. ) {
		vUV.y = floor( c / 10. ) * h;
	}
	if( vUV.y == 1. ) {
		vUV.y = floor( c / 10. ) * h + h;
	}
	vUV.y = 1. - vUV.y;
	if( vUV.x == 0. ) {
		vUV.x = mod( c, 10. ) / 10. + lefts[ iid ] / dimensions.x;
	}
	if( vUV.x == 1. ){
		vUV.x = mod( c, 10. ) / 10. + lefts[ iid ] / dimensions.x + widths[ iid ] / dimensions.x;
	}

	p.y *= dimensions.z;
	p *= .001;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );

}