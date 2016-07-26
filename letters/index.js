var THREE = require('three');
var Rebound = require('rebound');
var TWEEN = require('tween.js');
var Explosion = require('./Explosion');

var LETTERS = 'THESPIGAROLDUCKNWVY';
var MATCAPS = 'silver gold';
var VIEWPORT_WIDTH = 1000;
var VIEWPORT_HEIGHT = 1000;

var scene;
var renderer;
var camera;
var loader;

var letters = {};
var activeLetter;

var matcaps = {};
var material;

var rotation = 0;

var springSytem;
var inflateSpring;
var deflateTimeoutId;
var inflateRange;

var explosion;
var explosionRange;

/**
 * @function setup
 */
(function setup() {
  document.body.style.backgroundColor = '#1a1f27';

  var $viewport = document.createElement('div');
  $viewport.style.width = VIEWPORT_WIDTH + 'px';
  $viewport.style.height = VIEWPORT_HEIGHT + 'px';
  document.body.appendChild($viewport);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
  renderer.setClearColor(0x000000, 0);
  $viewport.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(45, VIEWPORT_WIDTH / VIEWPORT_HEIGHT, 1, 100);
  camera.position.z = 5;

  loader = new THREE.JSONLoader();

  material = new THREE.RawShaderMaterial({
    uniforms: {
      normalMap: { type: 't', value: null },
      textureMap: { type: 't', value: null },
      inflation: { type: 'f', value: 0 }
    },
    vertexShader: require('./shaders/vs-letter.glsl'),
    fragmentShader: require('./shaders/fs-letter.glsl')
  });

  var letter = window.location.hash.replace('#', '');
  letter = letter === '' ? LETTERS[0] : letter;
  loadLetter(letter);


  setMatcap(MATCAPS.split(' ')[0]);

  springSytem = new Rebound.SpringSystem();

  inflateSpring = springSytem.createSpring(40, 3);
  inflateSpring.addListener({
    onSpringUpdate: function(spring) {
      material.uniforms.inflation.value = spring.getCurrentValue();
    }
  });

  // ui
  LETTERS.split('').forEach(function(letter) {
    var button = document.createElement('button');
    button.innerHTML = letter;
    button.addEventListener('click', loadLetter.bind(null, letter));
    document.body.appendChild(button);
  });

  MATCAPS.split(' ').forEach(function(matcap) {
    var button = document.createElement('button');
    button.innerHTML = matcap;
    button.addEventListener('click', setMatcap.bind(null, matcap));
    document.body.appendChild(button);
  });

  var inflateButton = document.createElement('button');
  inflateButton.innerHTML = 'inflate';
  inflateButton.addEventListener('click', inflate);
  document.body.appendChild(inflateButton);

  inflateRange = document.createElement('input');
  inflateRange.type = 'range';
  inflateRange.min = -0.5;
  inflateRange.max = 0.5;
  inflateRange.step = 0.01;
  inflateRange.addEventListener('input', updateInflation);
  document.body.appendChild(inflateRange);

  explosion = new Explosion(null, {
    radius: 1
  });

  scene.add(explosion.el);

  explosionRange = document.createElement('input');
  explosionRange.type = 'range';
  explosionRange.min = 0;
  explosionRange.max = 1;
  explosionRange.step = 0.01;
  explosionRange.addEventListener('input', updateExplosion);
  document.body.appendChild(explosionRange);

  window.requestAnimationFrame(draw);
})();

/**
 * @function draw
 */
function draw() {
  window.requestAnimationFrame(draw);

  TWEEN.update();

  if(activeLetter !== void 0) {
    var rotationY = Math.sin(rotation);
    var rotationX = Math.cos(rotation / 2) / 2;

    letters[activeLetter].rotation.y = rotationY;
    letters[activeLetter].rotation.x = rotationX;

    explosion.el.rotation.y = rotationY;
    explosion.el.rotation.x = rotationX;
  }

  rotation += 0.02;

  renderer.render(scene, camera);
}

/**
 * @function loadLetter
 * @param {string} letter
 */
function loadLetter(letter) {
  window.location.hash = '#' + letter;

  if(letters[letter]) {
    if(activeLetter !== void 0) {
      scene.remove(letters[activeLetter]);
    }

    scene.add(letters[letter]);
    activeLetter = letter;
  }
  else {
    loader.load('./models/' + letter + '.json', function(geometry, materials) {
      if(activeLetter !== void 0) {
        scene.remove(letters[activeLetter]);
      }

      // needed because of the blender to .json exporter
      // other solutions are:
      // - using .obj
      // - exporting to .obj and converting to .json through the .py script
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      var mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1.5, 1.5, 1.5)
      scene.add(mesh);

      letters[letter] = mesh;
      activeLetter = letter;
    });
  }
}

/**
 * @function setMatcap
 * @param {string} matcap
 */
function setMatcap(matcap) {
  function set() {
    material.uniforms.normalMap.value = matcaps[matcap];
    material.uniforms.textureMap.value = matcaps[matcap];
    material.needsUpdate = true;
  }

  if(matcaps[matcap]) {
    set();
  }
  else {
    new THREE.TextureLoader().load('./textures/' + matcap + '.jpg', function(texture) {
      matcaps[matcap] = texture;
      set();
    });
  }
}

/**
 * @function inflate
 * @param {float} duration
 */
function inflate() {
  var tween = new TWEEN.Tween({ progress: 0 })
    .to({ progress: 1 }, 1500)
    .easing(TWEEN.Easing.Exponential.Out)
    .onUpdate(function() {
      explosion.setProgress(this.progress);
    })
    .start();

  inflateRange.value = 0;

  inflateSpring.setEndValue(0.07);

  if(deflateTimeoutId) {
    window.clearTimeout(deflateTimeoutId);
  }

  deflateTimeoutId = window.setTimeout(function() {
    inflateSpring.setEndValue(0);
  }, 200);
}

/**
 * @function updateInflation
 */
function updateInflation(e) {
  var value = parseFloat(e.currentTarget.value) || 0;
  inflateSpring.setEndValue(value);
}

/**
 * @function updateExplosion
 */
function updateExplosion(e) {
  var value = parseFloat(e.currentTarget.value) || 0;
  explosion.setProgress(value);
}
