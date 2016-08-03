var THREE = require('three');

/**
 * @class WorldManager
 */
var WorldManager = function(){
  THREE.EventDispatcher.call(this);

  this._init();
};

WorldManager.prototype = Object.create(THREE.EventDispatcher.prototype);

/**
 * @method init
 */
WorldManager.prototype._init = function() {
  this._loadAssets();
};

/**
 * @method laodAssets
 */
WorldManager.prototype._loadAssets = function() {
  this._createGeometries();
};

/**
 * @method createGeometries
 */
WorldManager.prototype._createGeometries = function() {
  this.dispatchEvent({ type : 'assetsLoaded' });
};

/**
 * @method update
 */
WorldManager.prototype.update = function(t) {};

module.exports = WorldManager;
