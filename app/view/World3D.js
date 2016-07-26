/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var Rebound = require('rebound');

var VRControls = require('./../utils/VRControls');
var VREffect = require('./../utils/VREffect');

var GamePads = require('./gamepads/GamePads');
var MousePad = require('./gamepads/MousePad');

var PhysicsManager = require('./PhysicsManager');
var WorldManager = require('./scene/WorldManager');
var that;

var World3D = function( container ) {

    that=this;

    this.container      = container;

    this.camera         = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.layers.enable( 1 );
    this.dummyCamera = new THREE.Object3D();
    this.dummyCamera.add( this.camera );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );

    //// Cannon.js physics manager
    this.phManager      = new PhysicsManager(this.dummyCamera,this.camera);

    //// Apply VR headset positional data to camera.
    this.controls       = new VRControls( this.camera );
    this.controls.standing = true;

    // Apply VR stereo rendering to renderer.
    this.effect = new VREffect( this.renderer, null, null, this.onRenderLeft.bind( this ), this.onRenderRight.bind( this ) );

    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: false, // Default: false.
        isUndistorted: false // Default: false.
    };
    this.manager = new WebVRManager( this.renderer, this.effect, params );
    this.worldManager = new WorldManager();
    this.addEvents();

    // Create plane to raycast
    this.planeCalc = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100, 2, 2 ) , new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0
    }) );

    //this.scene.add( this.planeCalc );
    this.scene.add( this.dummyCamera );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshNormalMaterial(  );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.y = 0.5;
    cube.position.z = 0.0;
    this.phManager.addStarterObject(cube,"cube");

    this.scene.add( cube );

    //Letters integration
    this.loader = new THREE.JSONLoader();

    this.letters = [];
    this.lettersMesh = [];
    this.lettersMatcapsCache = {};
    this.lettersBaseMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        normalMap: { type: 't', value: null },
        textureMap: { type: 't', value: null },
        inflation: { type: 'f', value: 0 },
        opacity: { type: 'f', value: 0 }
      },
      vertexShader: require('../glsl/vs-letter.glsl'),
      fragmentShader: require('../glsl/fs-letter.glsl'),
      transparent: true
    });

    this.meshes = [];

    this.jsonLoader = new THREE.JSONLoader();

    this.abc = this.getAbc(
      'THE  SPITE  GOOD LUCK   ON YOUR NEW  ADVENTURE',
      'GGG  GGGGG  SSSS SSSS   SS SSSS SSS  SSSSSSSSS' // S for silver, G for Gold
    );



    this.springSystem = new Rebound.SpringSystem();

};

/**
 * @interface ILetter {
 *  char letter;
 *  int index;
 *  string color;
 * }
 */

/**
 * @function getAbc
 * @param {string} text
 * @param {colors} colors G for Gold, S for silver
 * @returns {Array<ILetter>}
 */
World3D.prototype.getAbc = function(text, colors) {
    var letters = text.split('');

    var abc = [];

    for(var i = 0; i < letters.length; ++i) {
      var letter = letters[i];

      if(letter === ' ') {
        continue;
      }

      abc.push({
        letter: letter,
        index: i,
        color: colors[i]
      });
    }

    return abc;
};

/**
 * @function addLetter
 * @param {ILetter} letter
 */
World3D.prototype.addLetter = function(letter) {
  var url = '/assets/letters/models/' + letter.letter + '.json';

  this.jsonLoader.load(url, (function(geo, mats) {
    geo.computeFaceNormals();
    geo.computeVertexNormals();

    var mat = this.lettersBaseMaterial.clone();
    var matcap = letter.color === 'G' ? 'gold' : 'silver';
    this.setMatcap(mat, matcap);

    var mesh = new THREE.Mesh(geo, mat);
    //mesh.scale.set(0.75, 0.75, 0.75);
    mesh.geometry.scale(0.75, 0.75, 0.75);
    mesh.geometry.computeBoundingBox();
    //console.log(mesh);

    var boxsize= 20;
    var rdx = Math.floor(Math.random()*boxsize - boxsize/2 );
    var rdy = Math.floor(Math.random()*boxsize/2  );
    var rdz = Math.floor(Math.random()*boxsize - boxsize/2);
    mesh.position.set(rdx, rdy, rdz);
    mesh.springIndex = letter.index;

    mesh.material.transparent = true;
    mesh.material.opacity = 0;

    mesh.geometry.computeBoundingBox();
    this.scene.add(mesh);

    this.phManager.add3DObject(mesh, 'cube', false, true);
    //this.phManager.add3DObject(mesh, 'convex', false, true);


    var inflateSpring = that.springSystem.createSpring(40, 3);
    inflateSpring.setEndValue(1).setAtRest();

    inflateSpring.addListener({
      onSpringUpdate: function(spring) {
        mat.uniforms.inflation.value = spring.getCurrentValue();
      }
    });

    mesh.inflateSpring = inflateSpring;

    this.lettersMesh.push(mesh);

  }).bind(this));
};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( '#1a1f27', 1 );
    this.container.appendChild( this.renderer.domElement );

    this.positionTouch1 = new THREE.Vector3(0, 100, 0);
    this.positionTouch2 = new THREE.Vector3(0, 100, 0);

    this.render( 0 );

};

World3D.prototype.onModeChange = function( n, o ) {
    this.phManager.setMode(n);
    switch(n){
        case 3 :
            console.log('Passing to VR mode');

            break;
    }
};

World3D.prototype.addEvents = function() {
    this.manager.on('initialized', this.onInitializeManager.bind( this ) );
    this.manager.on('modechange', this.onModeChange.bind( this ) );

    this.worldManager.addEventListener( 'assetsLoaded', this.onAssetsLoaded.bind( this ) );
    this.phManager.addEventListener( 'starts', this.onStart.bind(this) );
};

World3D.prototype.onStart = function() {
  var springSystem = this.springSystem;

  var makeShapeAppear = (function(mesh) {

    var targetScale = mesh.scale.x;
    mesh.scale.set(0, 0, 0);
    mesh.visible = true;

    var spring = this.springSystem.createSpring(40, (Math.random() * 3) + 1);
    spring.setCurrentValue(0).setAtRest();

    spring.addListener({
      onSpringUpdate: function(spring) {
        var value = spring.getCurrentValue();
        mesh.scale.set(value, value, value);
      },
      onSpringAtRest: function(spring) {
        spring.removeAllListeners();
      }
    });

    setTimeout(function() {
      spring.setEndValue(targetScale);
    }, Math.random() * 2000);

  }).bind(this);

  var makeLetterAppear = (function(mesh) {

    var spring = this.springSystem.createSpring(40, 10);
    spring.setCurrentValue(0).setAtRest();

    spring.addListener({
      onSpringUpdate: function(spring) {
        var value = spring.getCurrentValue();
        mesh.material.uniforms.opacity.value = value;
      },
      onSpringAtRest: function(spring) {
        spring.removeAllListeners();
      }
    });

    setTimeout(function() {
      spring.setEndValue(1);
    }, Math.random() * 2000);

  }).bind(this);

  for(var i = 0; i < this.worldManager.meshes.length; ++i) {
    var mesh = this.worldManager.meshes[i];
    makeShapeAppear(mesh)
  }

  for(var i = 0; i < this.lettersMesh.length; ++i) {
    var letterMesh = this.lettersMesh[i];
    makeLetterAppear(letterMesh);
  }

  this.phManager.attractBodiesToPlayer();

};

World3D.prototype.onInitializeManager = function( n, o ) {

    if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {

        this.gamePads = new MousePad( this.scene, this.camera, this.effect, this.phManager );
        this.dummyCamera.position.z = 5;
        this.dummyCamera.position.y = - 0.3;

    } else {

        this.gamePads = new GamePads( this.scene, this.camera, this.effect,  this.phManager );

    }

    //this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.1, 10, 10), new THREE.MeshNormalMaterial() );
    //this.scene.add( this.pointer );


    if(this.gamePads.h2 !== undefined){
      this.phManager.add3DObject(this.gamePads.h2, "cube", true,false);
    }

    this.setup();
};

World3D.prototype.onAssetsLoaded = function( e ) {

    this.scene.add(this.worldManager.floor);


    this.phManager.setClosedArea(20,20,20);



    for (var i = 0; i < this.worldManager.meshes.length; i++) {
        var mesh = this.worldManager.meshes[i];
        this.scene.add( mesh );

        this.phManager.add3DObject(mesh,"sphere",false,false);

    }

    for(var i=0; i < this.abc.length; i++ ){

      this.addLetter(this.abc[i]);

    }

};

World3D.prototype.onRenderLeft = function() {
    //console.log('rendering Left', this);
};

World3D.prototype.onRenderRight = function() {
    //console.log('rendering Right', this);
};

World3D.prototype.render = function( timestamp ) {

    window.requestAnimationFrame( this.render.bind( this ) );
    this.planeCalc.lookAt( this.dummyCamera.position );
    this.gamePads.update( timestamp,[ this.planeCalc ] );

    //this.pointer.position.copy( this.gamePads.intersectPoint );

    // update world manager
    this.worldManager.update();

    // Update the physics

      this.phManager.update(timestamp);


    // Update VR headset position and apply to camera.
    this.controls.update();

    // Render the scene through the manager.
    this.renderer.setRenderTarget( null ); // add this line if you are working with GPGPU sims
    this.manager.render( this.scene, this.camera, timestamp);

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.effect.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
};

/**
 * @function setMatcap
 * @param {THREE.Material} mat
 * @param {string} matcap
 */
World3D.prototype.setMatcap =  function(mat, matcap) {
  var setUniforms = (function() {
    mat.uniforms.normalMap.value = mat.uniforms.textureMap.value = this.lettersMatcapsCache[matcap];
    mat.needsUpdate = true;
  }).bind(this);

  if(this.lettersMatcapsCache[matcap]) {
    setUniforms();
  }
  else {
    var url = '/assets/textures/' + matcap + '.jpg';
    this.lettersMatcapsCache[matcap] = new THREE.TextureLoader().load(url);
    setUniforms();
  }
};

module.exports = World3D;
