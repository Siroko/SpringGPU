/**
 * Created by siroko on 7/19/16.
 */

var THREE = require( 'three' );
var OBJLoader = require('./../../utils/OBJLoader');

var vs_bufferGeometry   = require('./../../glsl/vs-buffer-geometry.glsl');
var fs_bufferGeometry   = require('./../../glsl/fs-buffer-geometry.glsl');

var vs_environment      = require('./../../glsl/vs-environment.glsl');
var fs_environment      = require('./../../glsl/fs-environment.glsl');

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

        var texturePattern = THREE.ImageUtils.loadTexture('assets/textures/carrots-pattern.jpg' );
        texturePattern.wrapS = THREE.RepeatWrapping;
        texturePattern.wrapT = THREE.RepeatWrapping;
        texturePattern.repeat.x = 1000;
        texturePattern.repeat.y = 1000;

        this.room = object.children[ 0 ];
        this.room.material = new THREE.RawShaderMaterial( {
            uniforms: {
                map             : { type : 't', value : THREE.ImageUtils.loadTexture('assets/textures/baked_ao.png' ) },
                uPatternMap     : { type : 't', value : texturePattern }
            },

            vertexShader                : vs_environment,
            fragmentShader              : fs_environment
        } );

        this._createGeometries();


    } ).bind( this ), onProgress, onError );

};

WorldManager.prototype._createGeometries = function() {

    var sizeBase = 0.2;
    var radius = [];
    var scales = [];
    var positions = [];

    for ( var i = 0; i < 100; i++ ) {
        var s = ( Math.random() * 5 ) + 1;
        var p = new THREE.Vector3( ( Math.random() * 2 - 1) * 4.5, Math.random() * 4.5 + 4, ( Math.random() * 2 - 1 ) * 9 );
        positions.push( p );
        radius.push( sizeBase * s );
        scales.push( s );
    }

    var geom = new THREE.IcosahedronGeometry( sizeBase, 1 );
    var mat = new THREE.RawShaderMaterial( {
        uniforms: {
            normalMap             : { type : 't', value : THREE.ImageUtils.loadTexture('assets/textures/matcap.png' ) },
            textureMap            : { type : 't', value : THREE.ImageUtils.loadTexture('assets/textures/matcap.png' ) },
            uSpheresPositions     : { type : 'v3v', value : positions },
            uSpheresRadius        : { type : 'fv', value : radius }
        },

        vertexShader                : vs_bufferGeometry,
        fragmentShader              : fs_bufferGeometry
    } );

    var mesh;
    for ( var i = 0; i < positions.length; i++ ) {

        mesh = new THREE.Mesh( geom, mat );
        mesh.position.copy( positions[ i ] );

        var s = scales[ i ];
        mesh.scale.set( s, s, s );
        this.meshes.push( mesh );
    }

    this.dispatchEvent( { type : 'assetsLoaded' } );

};

WorldManager.prototype.update = function( t ) {

};

module.exports = WorldManager;