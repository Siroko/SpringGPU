/**
 * Created by siroko on 7/11/16.
 */

var THREE = require('three');

var BaseGLPass = require('./BaseGLPass');

var vs_bufferGeometry   = require('../glsl/vs-buffer-geometry.glsl');
var fs_bufferGeometry   = require('../glsl/fs-buffer-geometry.glsl');
var vs_simpleQuad       = require('../glsl/vs-simple-quad.glsl');
var fs_updatePositions  = require('../glsl/fs-update-positions-geometry.glsl');
var fs_updateSpring     = require('../glsl/fs-update-positions-spring.glsl');

var GPUDisplacedGeometry = function( params ) {

    BaseGLPass.call( this, params );

    this.geom = params.geom;
    this.pingpong           = 0;

    if( this.geom.faces ) {
        var totalGeomVertices = this.geom.faces.length * 3;
    } else {
        var totalGeomVertices = this.geom.attributes.position.array.length / 3;
    }

    var sqrtTotalGeom       = Math.sqrt( totalGeomVertices );
    // Aproximatino to the nearest upper power of two number
    var totalPOT            = Math.pow( 2, Math.ceil( Math.log( sqrtTotalGeom ) / Math.log( 2 ) ) );

    this.sizeW = totalPOT;
    this.sizeH = totalPOT;

    this.total              = this.sizeW * this.sizeH;

    this.finalPositionsRT   = this.getRenderTarget( this.sizeW, this.sizeH );
    this.springRT           = this.getRenderTarget( this.sizeW, this.sizeH );

    var volume = 10;

    this.data = new Float32Array(this.total * 4);

    if( this.geom.faces ) {

        var v;
        var vertices = this.geom.vertices;
        for (var i = 0; i < this.geom.faces.length; i++) {

            var face = this.geom.faces[i];

            v = vertices[face.a];
            this.data[i * 12] = v.x;
            this.data[i * 12 + 1] = v.y;
            this.data[i * 12 + 2] = v.z;
            this.data[i * 12 + 3] = 1;

            v = vertices[face.b];
            this.data[i * 12 + 4] = v.x;
            this.data[i * 12 + 5] = v.y;
            this.data[i * 12 + 6] = v.z;
            this.data[i * 12 + 7] = 1;

            v = vertices[face.c];
            this.data[i * 12 + 8] = v.x;
            this.data[i * 12 + 9] = v.y;
            this.data[i * 12 + 10] = v.z;
            this.data[i * 12 + 11] = 1;
        }

    } else {
        var it = 0;
        for (var i = 0; i < this.geom.attributes.position.array.length; i++) {

            var position = this.geom.attributes.position.array[ i ];
            this.data[ it ] = position;

            if( ( i + 1 ) % 3 == 0 && i != 0 ) {
                it++;
                this.data[ it ] = 1;
            }
            it ++;

        }
    }

    this.geometryRT = new THREE.DataTexture( this.data, this.sizeW, this.sizeH, THREE.RGBAFormat, THREE.FloatType);
    this.geometryRT.minFilter = THREE.NearestFilter;
    this.geometryRT.magFilter = THREE.NearestFilter;
    this.geometryRT.needsUpdate = true;


    this.index2D            = new THREE.BufferAttribute( new Float32Array( this.total * 2 ), 2 );
    this.positions          = new THREE.BufferAttribute( new Float32Array( this.total * 3 ), 3 );

    var div = 1 / this.sizeW;
    var uv = new THREE.Vector2(0, 0);
    for (var i = 0; i < this.total; i++) {

        uv.x = ( i % this.sizeW ) / this.sizeW;
        if ( i % this.sizeW == 0 && i != 0) uv.y += div;
        this.index2D.setXY( i, uv.x, uv.y );
        if( this.geom.faces ) {
            this.positions.setXYZ(i, ( ( Math.random() * 10 - 1 ) * 0.5 ) * volume, ( ( Math.random() * 2 - 1 ) * 0.5 ) * volume, ( ( Math.random() * 2 - 1 ) * 0.5 ) * volume);
        } else {
            if( this.geom.attributes.position.array[ i * 3 ] ) {
                this.positions.setXYZ( i, this.geom.attributes.position.array[i * 3], this.geom.attributes.position.array[i * 3 + 1], this.geom.attributes.position.array[i * 3 + 2] );
            } else {
                this.positions.setXYZ( i, 0, 0, 0 );
            }
        }
    }

    console.log( this.total, this.sizeW);

    this.bufferGeometry = new THREE.BufferGeometry();
    this.bufferGeometry.addAttribute( 'aV2I', this.index2D );
    this.bufferGeometry.addAttribute( 'position', this.positions );

    this.bufferMaterial = new THREE.RawShaderMaterial({
        'uniforms': {
            'uPositionsTexture'     : { type: 't', value: this.geometryRT },
            'normalMap'             : params.uniforms.normalMap,
            'textureMap'            : params.uniforms.textureMap
        },

        vertexShader                : vs_bufferGeometry,
        fragmentShader              : fs_bufferGeometry

    });

    this.mesh = new THREE.Mesh( this.bufferGeometry, this.bufferMaterial );
    this.mesh.updateMatrix();

    this.updateSpringMaterial = new THREE.RawShaderMaterial( {
        'uniforms': {
            'uBasePositions'        : { type: 't', value: this.geometryRT },
            'uPrevPositions'        : { type: 't', value: this.geometryRT },
            'uPrevPositionsGeom'    : { type: 't', value: this.geometryRT },
            'uTime'                 : { type: 'f', value: 1 },
            'uTouch'                : params.uniforms.uTouch,
            'uWorldPosition'        : params.uniforms.uWorldPosition,
            'uModelMatrix'          : { type: 'm4', value: this.mesh.matrix }
        },

        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_updateSpring

    } );

    this.updatePositionsMaterial = new THREE.RawShaderMaterial({
        'uniforms': {
            'uPrevPositions'        : { type: 't', value: this.geometryRT },
            'uSpringTexture'        : { type: 't', value: this.springRT }
        },

        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_updatePositions

    });

    this.planeDebug = new THREE.Mesh( this.quad_geom, new THREE.MeshBasicMaterial({map:this.springRT}));
    this.planeDebug.rotation.x = Math.PI * 1.5;

    this.springPositionsTargets     = [  this.springRT,  this.springRT.clone() ];
    this.finalPositionsTargets      = [  this.finalPositionsRT,  this.finalPositionsRT.clone() ];

    this.pass( this.updateSpringMaterial, this.springPositionsTargets[ this.pingpong ] );
    this.pass( this.updatePositionsMaterial, this.finalPositionsTargets[ this.pingpong ] );


};

GPUDisplacedGeometry.prototype = Object.create( BaseGLPass.prototype );

GPUDisplacedGeometry.prototype.update = function() {

    this.updateSpringMaterial.uniforms.uPrevPositions.value = this.springPositionsTargets[ this.pingpong ];
    this.updateSpringMaterial.uniforms.uPrevPositionsGeom.value = this.finalPositionsTargets[ this.pingpong ];

    this.updatePositionsMaterial.uniforms.uSpringTexture.value = this.springPositionsTargets[ this.pingpong ];
    this.updatePositionsMaterial.uniforms.uPrevPositions.value = this.finalPositionsTargets[ this.pingpong ];

    this.bufferMaterial.uniforms.uPositionsTexture.value = this.finalPositionsTargets[ this.pingpong ];


    this.pingpong = 1 - this.pingpong;
    this.pass( this.updateSpringMaterial, this.springPositionsTargets[ this.pingpong ] );
    this.pass( this.updatePositionsMaterial, this.finalPositionsTargets[ this.pingpong ] );
};


module.exports = GPUDisplacedGeometry;