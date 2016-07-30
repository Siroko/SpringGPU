var THREE = require('three');
var textureLoader = require('../utils').textureLoader;

/**
 * @class Cube
 * @constructor
 * @param {float} [size=1]
 */
function Cube(size) {
  size = size || 1;

  var geometry = new THREE.BoxBufferGeometry(size, size, size);

  var material = new THREE.MeshBasicMaterial({
    map: textureLoader.load('assets/textures/breel.jpeg')
  });

  this.el = new THREE.Mesh(geometry, material);
};

/**
 * @method dispose
 */
Cube.prototype.dispose = function() {
  if(this.el.parent) {
    this.el.remove(this.el);
  }
};

module.exports = Cube;
