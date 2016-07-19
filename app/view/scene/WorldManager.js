/**
 * Created by siroko on 7/19/16.
 */

var THREE = require( 'three' );
var OBJLoader = require('./../../utils/OBJLoader');

var vs_bufferGeometry   = require('./../../glsl/vs-buffer-geometry.glsl');
var fs_bufferGeometry   = require('./../../glsl/fs-buffer-geometry.glsl');

var WorldManager = function(){

    THREE.EventDispatcher.call( this );

    this.room = null;
    this.meshes = [];

    this._init();

};

// Inherits from eventdispatcher in order to be able to dispatch events from this class
WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype._init = function() {

    this._loadAssets();

};

WorldManager.prototype._loadAssets = function() {

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2 ) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    var objLoader = new OBJLoader();
    objLoader.setPath( 'assets/obj/' );
    objLoader.load( 'enviro.obj', (function ( object ) {

        this.room = object.children[ 0 ];
        this.room.material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('assets/textures/baked_ao.png' ) } );

        this._createGeometries();


    } ).bind( this ), onProgress, onError );

};

WorldManager.prototype._createGeometries = function() {

    var geom = new THREE.IcosahedronGeometry( 0.2, 3 );
    var mat = new THREE.RawShaderMaterial( {
        uniforms: {
            normalMap             : { type : 't', value : THREE.ImageUtils.loadTexture('assets/textures/matcap.jpg' ) },
            textureMap            : { type : 't', value : THREE.ImageUtils.loadTexture('assets/textures/matcap.jpg' ) }
        },

        vertexShader                : vs_bufferGeometry,
        fragmentShader              : fs_bufferGeometry
    } );

    var mesh;
    for ( var i = 0; i < 100; i++ ) {

        mesh = new THREE.Mesh( geom, mat );
        mesh.position.set( ( Math.random() * 2 - 1) * 4.5, Math.random() * 4.5 + 4, ( Math.random() * 2 - 1 ) * 9 );
        this.meshes.push( mesh );
    }

    this.dispatchEvent( { type : 'assetsLoaded' } );

};

WorldManager.prototype.update = function( t ) {

};

module.exports = WorldManager;