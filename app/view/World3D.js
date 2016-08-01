/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var TWEEN = require('tween.js');
var Rebound = require('rebound');

var VRControls = require('./../utils/VRControls');
var VREffect = require('./../utils/VREffect');

var GamePads = require('./gamepads/GamePads');
var MousePad = require('./gamepads/MousePad');

var PhysicsManager = require('./PhysicsManager');
var WorldManager = require('./scene/WorldManager');
var that;

var SoundManager = require('./sound/SoundManager');
var AssetsSound = require('./sound/AssetsSound');

var Floor = require('./floor/Floor');
var Cube = require('./cube/Cube');
var Explosion = require('./explosion/Explosion');
var Confettis = require('./confettis/Confettis');
var Letter = require('./letter/Letter');
var Shape = require('./shape/Shape');

var random = require('./utils').random;

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

    var floor = new Floor();
    this.scene.add(floor.el);

    var introCube = new Cube(1);
    introCube.el.position.y = 0.5;
    this.scene.add(introCube.el);

    that.phManager.addStarterObject(introCube.el,"cube");





    //Letters integration
    this.letters = [];
    this.shapes = [];




    // sounds
    this.soundManager = new SoundManager();
    this.soundManager.addSounds(AssetsSound.Sounds);
    this.balloonSoundIndex = 0;
    this.isSuccessSoundPlaying = false;

    // springs
    this.springSystem = new Rebound.SpringSystem();

    // effects
    this.explosionsPool = [];

    // confettis
    this.confettis = new Confettis(new THREE.Vector3(10, 10, 10), 1200, false);
    this.confettis.el.position.y += 5;
    this.isConfettisActive = false; 
};

/**
 * @interface ILetter {
 *  char letter;
 *  int index;
 *  string color;
 * }
 */

/**
 * @function getLettersInfos
 * @param {string} text
 * @param {colors} colors
 * @param {{[key:string]:string}} colorsTable
 * @returns {Array<ILetter>}
 */
World3D.prototype.getLettersInfos = function(text, colors, colorsTable) {
    var letters = text.split('');

    var lettersInfos = [];

    for(var i = 0; i < letters.length; ++i) {
      var letter = letters[i];

      if(letter === ' ') {
        continue;
      }

      var letterInfos = {
        letter: letter,
        index: i,
        color: colorsTable[colors[i]]
      }

      lettersInfos.push(letterInfos);
    }

    return lettersInfos;
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
    this.phManager.addEventListener('letterHit', this.onLetterHit.bind(this));
    this.phManager.addEventListener('messageDone', this.onMessageComplete.bind(this));
    this.phManager.addEventListener('messageUnlocked', this.onMessageRelease.bind(this));
};

/**
 * Cube has been hit.
 *
 * @method onStart
 */
World3D.prototype.onStart = function() {
  this.soundManager.play(AssetsSound.BACKGROUND_NORMAL);

  for(var i = 0; i < this.shapes.length; ++i) {
    this.shapes[i].fadeIn();
  }

  for(var i = 0; i < this.letters.length; ++i) {
    this.letters[i].fadeIn();
  }

  this.phManager.attractBodiesToPlayer();

};

/**
 * All the letters are in place.
 *
 * @method onMessageComplete
 */
World3D.prototype.onMessageComplete = function() {
  this.soundManager.fadeOut(AssetsSound.BACKGROUND_NORMAL);

  if(this.isSuccessSoundPlaying) {
    this.soundManager.fadeIn(AssetsSound.BACKGROUND_SUCCESS);
  }
  else {
    this.soundManager.play(AssetsSound.BACKGROUND_SUCCESS);
    this.isSuccessSoundPlaying = true;
  }

  if(!this.isConfettisActive) {
    this.isConfettisActive = true; 
    this.scene.add(this.confettis.el);
  }

  this.confettis.start();

  for(var i = 0; i < this.shapes.length; ++i) {
    this.shapes[i].startTripping();
  }

  for(var i = 0; i < this.letters.length; ++i) {
    this.letters[i].startInflateLoop(random(1000, 5000));
  }
};

/**
 * The letters are no longer all in place.
 *
 * @method onMessageRelease
 */
World3D.prototype.onMessageRelease = function() {
  this.soundManager.fadeIn(AssetsSound.BACKGROUND_NORMAL);
  this.soundManager.fadeOut(AssetsSound.BACKGROUND_SUCCESS);

  for(var i = 0; i < this.shapes.length; ++i) {
    this.shapes[i].stopTripping();
  }

  for(var i = 0; i < this.letters.length; ++i) {
    this.letters[i].stopInflateLoop();
  }
};

/**
 * @interface ILetterHitEvent {
 *  THREE.Mesh mesh;
 * }
 *
 * @method onLetterHit
 * @param {ILetterHitEvent} e
 */
World3D.prototype.onLetterHit = function(e) {
  var mesh = e.mesh;
  var letter = mesh.letter;

  var explosion = this.explosionsPool.length
    ? this.explosionsPool.pop()
    : new Explosion();

  explosion.setParent(this.scene);
  explosion.el.position.copy(mesh.position);

  new TWEEN.Tween({ progress: 0 })
    .to({ progress: 1 }, 400)
    .onUpdate(function() {
      explosion.setProgress(this.progress);
    })
    .onComplete((function() {
      this.explosionsPool.push(explosion);
      explosion.setParent(null);
    }).bind(this))
    .start();

  // inflate
  letter.inflate();

  // sound
  this.balloonSoundIndex++;

  if(this.balloonSoundIndex >= 4) {
    this.balloonSoundIndex = 0;
  }

  var sound;

  switch(this.balloonSoundIndex) {
    case 0:
      sound = AssetsSound.BALLOON_1;
      break;

    case 1:
      sound = AssetsSound.BALLOON_2;
      break;

    case 2:
      sound = AssetsSound.BALLOON_3;
      break;

    case 3:
      sound = AssetsSound.BALLOON_4;
      break;
  }

  this.soundManager.play(sound);
};

World3D.prototype.onInitializeManager = function( n, o ) {

    if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {

        this.gamePads = new MousePad( this.scene, this.camera, this.effect, this.phManager );
        this.dummyCamera.position.z = 5;
        this.dummyCamera.position.y = 0.5;

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

    var boxSize = 20;

    this.phManager.setClosedArea(boxSize, boxSize, boxSize);

    // shapes
    for(var i = 0; i < 100; ++i) {
      var shape = new Shape();

      var x = random(-boxSize / 2, boxSize / 2);
      var y = random(-boxSize / 2, boxSize / 2);
      var z = random(-boxSize / 2, boxSize / 2);

      shape.el.position.set(x, y, z);

      this.shapes.push(shape);
      this.scene.add(shape.el);
      this.phManager.add3DObject(shape.el, 'sphere', false, false);
    }

    // letters
    var lettersInfos = this.getLettersInfos(
      'THE  SPITE  GOOD LUCK   ON YOUR NEW  ADVENTURE',
      'GGG  GGGGG  SSSS SSSS   SS SSSS SSS  SSSSSSSSS',
      {
        S: 'silver',
        G: 'gold'
      }
    );

    this.phManager.setLettersLength(lettersInfos.length);

    for(var i = 0; i < lettersInfos.length; i++ ){
      var letterInfos = lettersInfos[i];

      var letter = new Letter(letterInfos.letter, letterInfos.color);

      // attach letter to el
      // that way we can access back the Letter onLetterHit
      letter.el.letter = letter;


      var x = random(-boxSize / 2, boxSize / 2);
      var y = random(-boxSize / 2, boxSize / 2);
      var z = random(-boxSize / 2, boxSize / 2);

      letter.el.position.set(x, y, z);

      letter.el.springIndex = letterInfos.index;

      this.letters.push(letter);
      this.scene.add(letter.el);

      var addToPhysicSimulation = (function(letter) {
        this.phManager.add3DObject(letter.el, 'cube', false, true);
        letter.removeEventListener(addToPhysicSimulation);
      }).bind(this, letter);

      if(letter.isReady) {
        addToPhysicSimulation();
      }
      else {
        letter.addEventListener('ready', addToPhysicSimulation);
      }
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

    TWEEN.update();

    for(var i = 0; i < this.shapes.length; ++i) {
      this.shapes[i].update(0.01);
    }

    this.confettis.update();

    this.planeCalc.lookAt( this.dummyCamera.position );
    this.gamePads.update( timestamp,[ this.planeCalc ] );

    // Update the physics
    this.phManager.update(timestamp);

    // Update VR headset position and apply to camera.
    this.controls.update();

    // Render the scene through the manager.
    //this.renderer.setRenderTarget( null ); // add this line if you are working with GPGPU sims
    this.manager.render( this.scene, this.camera, timestamp);

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.effect.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
};

module.exports = World3D;
