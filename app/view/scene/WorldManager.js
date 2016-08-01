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
      this._createGeometries();
};

WorldManager.prototype._createGeometries = function() {

    this.dispatchEvent( { type : 'assetsLoaded' } );

};


WorldManager.prototype.update = function( t ) {
};

module.exports = WorldManager;
