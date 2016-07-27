var THREE = require('three');

/**
 * @interface IExplosionOptions: {
 *  float radius;
 * }
 *
 * @class Explosion
 * @constructor
 * @param {IExplosionOptions} options
 */
function Explosion(options) {
  this._options = options || {};

  if(this._options.radius === void 0) {
    this._options.radius = 1;
  }

  this._parent = null;
  this.el = new THREE.Object3D();

  this._lineMaterial = null;

  this._init();
};

/**
 * @method init
 */
Explosion.prototype._init = function() {
  var sphereGeometry = new THREE.SphereGeometry(this._options.radius, 12, 12);

  this._lineMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      progress: { type: 'f', value: 0 }
    },
    vertexShader: require('./shaders/vs-explosion.glsl'),
    fragmentShader: require('./shaders/fs-explosion.glsl'),
    transparent: true,
    linewidth: 2
  });

  for(var i = 0; i < sphereGeometry.vertices.length; ++i) {
    var vertice = sphereGeometry.vertices[i];

    var endOffset = Math.random() * 2;

    var endX = vertice.x * endOffset;
    var endY = vertice.y * endOffset;
    var endZ = vertice.z * endOffset;

    var startOffset = Math.random() * 0.5 + 2;

    var startX = endX * startOffset;
    var startY = endY * startOffset;
    var startZ = endZ * startOffset;

    // attributes
    var positions = new Float32Array([
      startX, startY, startZ,
      endX, endY, endZ
    ]);

    var influences = new Float32Array([
      1,
      0
    ]);

    var tints = new Float32Array([
      Math.random(), Math.random(), Math.random(),
      Math.random(), Math.random(), Math.random()
    ]);

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('influence', new THREE.BufferAttribute(influences, 1));
    geometry.addAttribute('tint', new THREE.BufferAttribute(tints, 3));

    var line = new THREE.Line(geometry, this._lineMaterial);
    this.el.add(line);
  }
};

/**
 * @method setParent
 * @param {THREE.Object3D} parent
 */
Explosion.prototype.setParent = function(parent) {
  if(this._parent) {
    this._parent.remove(this.el);
  }

  this._parent = parent;
  this._parent.add(this.el);
};

/**
 * @method setProgress
 * @param {float} valu from 0 to 1
 */
Explosion.prototype.setProgress = function(value) {
  this._lineMaterial.uniforms.progress.value = value;
};

/**
 * @method dispose
 */
Explosion.prototype.dispose = function() {
  if(this._parent) {
    this._parent.remove(this.el);
  }
};

module.exports = Explosion;
