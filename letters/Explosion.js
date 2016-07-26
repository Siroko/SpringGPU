var THREE = require('three');

/**
 * @interface IExplosionOptions: {
 *  float radius;
 * }
 *
 * @class Explosion
 * @param {HTMLElement} parent
 * @param {IExplosionOptions} options
 */
function Explosion(parent, options) {
  this.options = options || {};

  if(this.options.radius === void 0) {
    this.options.radius = 1;
  }

  this.parent = parent;
  this.el = new THREE.Object3D();

  if(this.parent) {
    this.parent.add(el);
  }

  this.init();
};

/**
 * @method init
 */
Explosion.prototype.init = function() {
  var sphereGeometry = new THREE.SphereGeometry(this.options.radius, 12, 12);

  this.lineMaterial = new THREE.RawShaderMaterial({
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

    var line = new THREE.Line(geometry, this.lineMaterial);
    this.el.add(line);
  }
};

/**
 * @method setProgress
 * @param {float} valu from 0 to 1
 */
Explosion.prototype.setProgress = function(value) {
  this.lineMaterial.uniforms.progress.value = value;
};

/**
 * @method dispose
 */
Explosion.prototype.dispose = function() {
  if(this.parent) {
    this.parent.remove(this.el);
  }
};

module.exports = Explosion;
