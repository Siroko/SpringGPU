var THREE = require('three');
var textureLoader = require('../utils').textureLoader;

/**
 * @class Floor
 * @constructor
 */
function Floor() {
  this.el = new THREE.Object3D();
  this.el.rotation.x = -Math.PI / 2;

  var floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    new THREE.MeshBasicMaterial({ color: '#1a1f27' })
  );

  this.el.add(floor);

  var center = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(6, 6),
    new THREE.MeshBasicMaterial({
      map: textureLoader.load('assets/textures/floor.png'),
      transparent: true
    })
  );

  center.position.z = 0.01;

  this.el.add(center);
};

/**
 * @method dispose
 * @public
 */
Floor.prototype.dispose = function() {
  if(this.el.parent) {
    this.el.parent.remove(this.el);
  }
};

module.exports = Floor;
