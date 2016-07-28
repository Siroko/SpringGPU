var THREE = require('three');
var random = require('./utils').random;

/**
 * @interface IBoundaries {
 *  float top;
 *  float bottom;
 *  float left;
 *  float right;
 *  float front;
 *  float back;
 * }
 */

/**
 * @param {THREE.Vector3} size
 * @param {int} count
 * @param {boolean} debug
 */
function Confettis(size, count, debug) {
  this._size = size;
  this._count = count || 200;
  this._boudaries = this._getBoundaries();

  this.el = new THREE.Object3D();

  if(debug) {
    var helpers = this._getHelpers();
    this.el.add(helpers);
  }

  this._confettisGeometry = this._getConfettisGeometry();

  this._points = new THREE.Points(this._confettisGeometry, Confettis._confettisMaterial);

  this.el.add(this._points);

  this._isActive = false;
};

/**
 * @property confettisMaterial
 * @static
 */
Confettis._confettisMaterial = new THREE.RawShaderMaterial({
  uniforms: {
    size: {
      type: 'f',
      value: 40
    },
    map: {
      type: 't',
      value: new THREE.TextureLoader().load('assets/textures/confettis.png')
    },
    repeat: {
      type: 'v2',
      value: new THREE.Vector2(1 / 6, 1)
    }
  },
  vertexShader: require('../glsl/vs-confettis.glsl'),
  fragmentShader: require('../glsl/fs-confettis.glsl'),
  transparent: true,
  depthWrite: false
});

Confettis._floorMaterial = null;

/**
 * @method getHelpers
 * @returns {THREE.Object3D}
 */
Confettis.prototype._getHelpers = function() {
  var helpers = new THREE.Object3D();

  var boundingBox = new THREE.Mesh(
    new THREE.BoxBufferGeometry(this._size.x, this._size.y, this._size.z),
    new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true
    })
  );
  
  helpers.add(boundingBox);

  return helpers;
};

/**
 * @method getConfettisGeometry
 * @returns {THREE.Geometry}
 */
Confettis.prototype._getConfettisGeometry = function() {
  var geometry = new THREE.BufferGeometry();

  var positions = new Float32Array(3 * this._count);
  var rotations = new Float32Array(this._count);
  var colors = new Float32Array(3 * this._count);
  var scales = new Float32Array(this._count);
  var offsets = new Float32Array(2 * this._count);

  this._velocities = new Float32Array(3 * this._count);

  for(var i = 0, j = 0, k = 0; i < this._count; ++i, j += 3, k += 2) {
    positions[j] = random(this._boudaries.left, this._boudaries.right);
    positions[j + 1] = random(this._boudaries.top, this._boudaries.top + this._size.y / 10);
    positions[j + 2] = random(this._boudaries.front, this._boudaries.back);

    // rotation
    rotations[i] = random(0, 2 * Math.PI);

    // color
    colors[j] = Math.random();
    colors[j + 1] = Math.random();
    colors[j + 2] = Math.random();

    // scale
    scales[i] = random(1, 2);

    // uv offset
    offsets[k] = random(0, 5, true) * (1 / 6);
    offsets[k + 1] = 0;

    // velocity
    this._velocities[j] = random(-0.01, 0.01);
    this._velocities[j + 1] = random(-0.03, 0);
    this._velocities[j + 2] = 0;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.addAttribute('scale', new THREE.BufferAttribute(scales, 1));
  geometry.addAttribute('offset', new THREE.BufferAttribute(offsets, 2));

  return geometry;
};

/**
 * @method getBoundaries
 * @returns {IBoundaries}
 */
Confettis.prototype._getBoundaries = function() {
  var halfX = this._size.x / 2;
  var halfY = this._size.y / 2;
  var halfZ = this._size.z / 2;

  return {
    left: -halfX,
    right: halfX,
    top: halfY,
    bottom: -halfY,
    front: halfZ,
    back: -halfZ
  }
};

/**
 * @method update
 */
Confettis.prototype.update = function() {
  if(!this._isActive) {
    return;
  }

  // apply velocity to position
  var positions = this._confettisGeometry.attributes.position.array;
  var velocities = this._velocities;

  for(var i = 0; i < positions.length; i += 3) {
    if(positions[i + 1] < this._boudaries.bottom) {
      positions[i + 1] = this._boudaries.top;

      if(positions[i] < this._boudaries.left) {
        positions[i] = this._boudaries.right;
      }
      else if(positions[i] > this._boudaries.right) {
        positions[i] = this._boudaries.left;
      }

      if(positions[i + 2] > this._boudaries.front) {
        positions[i + 2] = this._boudaries.back; 
      }
      else if(positions[i + 2] < this._boudaries.back) {
        positions[i + 2] = this._boudaries.front;
      }
    }

    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];
  }

  this._confettisGeometry.attributes.position.needsUpdate = true;
};

/**
 * @method start
 */
Confettis.prototype.start = function() {
  this._isActive = true;
};

/**
 * @method stop
 */
Confettis.prototype.stop = function() {
  this._isActive = false;
};

/**
 * @method dispose
 */
Confettis.prototype.dispose = function() {
  if(this.el.parent) {
    this.el.parent.remove(this.el);
  }
};

module.exports = Confettis;
