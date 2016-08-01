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
    var textureLoader = new THREE.TextureLoader();

    objLoader.setPath( 'assets/obj/' );
    objLoader.load( 'enviro.obj', (function ( object ) {

        var texturePattern = textureLoader.load('assets/textures/patt2.png' );
        texturePattern.wrapS = THREE.RepeatWrapping;
        texturePattern.wrapT = THREE.RepeatWrapping;
        texturePattern.repeat.x = 1000;
        texturePattern.repeat.y = 1000;

        this.room = object.children[ 0 ];
        this.room.material = new THREE.RawShaderMaterial( {
            uniforms: {
                map             : { type : 't', value : textureLoader.load('assets/textures/baked_ao.png' ) },
                uPatternMap     : { type : 't', value : texturePattern }
            },

            vertexShader                : vs_environment,
            fragmentShader              : fs_environment
        } );

        this._createGeometries();


    } ).bind( this ), onProgress, onError );

};

WorldManager.prototype._createGeometries = function() {

    this.dispatchEvent( { type : 'assetsLoaded' } );

};


WorldManager.prototype.update = function( t ) {
};

module.exports = WorldManager;
