/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');

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

    this.scene.add( this.planeCalc );
    this.scene.add( this.dummyCamera );

    //Adding Three Objects to Physic Manager
    //Adding object
    var geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
    var material = new THREE.MeshNormalMaterial(  );
    this.cubetest = new THREE.Mesh( geometry, material );
    this.cubetest.position.y = 2;
    //this.phManager.add3DObject(this.cubetest,"cube",false,false);
    //this.scene.add( this.cubetest );


    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshNormalMaterial(  );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.y = 10;
    //this.phManager.add3DObject(cube,"cube",false,false);
    //this.scene.add( cube );

    //Letters integration
    this.loader = new THREE.JSONLoader();
    this.letters = {};
    this.activeLetter;

    this.lMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        normalMap: { type: 't', value: null },
        textureMap: { type: 't', value: null }
      },
      vertexShader: require('../../letters/shaders/vs-buffer-geometry.glsl'),
      fragmentShader: require('../../letters/shaders/fs-buffer-geometry.glsl')
    });

    //this.abc = "ABCDEFGHIJKLMNOPQRSTUVWXZ";
    //this.abc = "ACDDEEEEEGHIKLNNNOOOOPRRSTTTUUUVW";
    this.meshes = [];
    this.abc = [
      ["A",36],
      ["C",19],
      ["D",15],["D",37],
      ["E",2],["E",8],["E",33],["E",39],["E",44],
      ["G",12],
      ["H",1],
      ["I",6],
      ["K",20],
      ["L",17],
      ["N",25],["N",32],["N",40],
      ["O",13],["O",14],["O",24],["O",28],
      ["P",5],
      ["R",30],["R",43],
      ["S",4],
      ["T",0],["T",7],["T",41],
      ["U",18],["U",29],["U",42],
      ["V",38],
      ["W",34],
      ["Y",27]
    ]

};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
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

};

World3D.prototype.onInitializeManager = function( n, o ) {

    if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {

        this.gamePads = new MousePad( this.scene, this.camera, this.effect );
        this.dummyCamera.position.z = 5;
        this.dummyCamera.position.y = - 0.3;

    } else {

        this.gamePads = new GamePads( this.scene, this.camera, this.effect,  this.phManager );

    }

    //this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.1, 10, 10), new THREE.MeshNormalMaterial() );
    //this.scene.add( this.pointer );

    this.phManager.add3DObject(this.gamePads.h1, "cube", true,false);
    if(this.gamePads.h2 !== undefined){
      this.phManager.add3DObject(this.gamePads.h2, "cube", true,false);
    }

    this.setup();
};

World3D.prototype.onAssetsLoaded = function( e ) {

    this.scene.add( this.worldManager.room );
    this.phManager.setClosedArea(this.worldManager.room);



    for (var i = 0; i < this.worldManager.meshes.length; i++) {
        var mesh = this.worldManager.meshes[i];
        this.scene.add( mesh );

        this.phManager.add3DObject(mesh,"sphere",false,false);
    }


    var loader = new THREE.JSONLoader();
    function setSpringIndexToMeshes(){
      console.log("let's go");
      for(var i=0; i < that.abc.length; i++ ){
        that.meshes[i].springIndex = that.abc[i][1];

      }
    }

    for(var i=0; i < this.abc.length; i++ ){


      loader.load('/assets/letters/models/' + this.abc[i][0] + '.json', function(geometry, materials,index) {
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        

        var mesh = new THREE.Mesh(geometry, that.lMaterial);
        mesh.scale.set(0.75, 0.75, 0.75);
        mesh.position.set(0, 1, 2);
        mesh.springIndex = that.abc[index][1];;
        that.setMatcap("silver");
        that.scene.add(mesh);
        that.phManager.add3DObject(mesh,"cube",false,true);

      }, function(){}, function(){}, i);

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


    // Update the physics
    this.phManager.update(timestamp);

    // Update VR headset position and apply to camera.
    this.controls.update();

    // Render the scene through the manager.
    this.renderer.setClearColor( 0x202020 );
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

/**
 * @function setMatcap
 * @param {string} matcap
 */
World3D.prototype.setMatcap =  function(matcap) {
  var ltexture;
  function set() {
    that.lMaterial.uniforms.normalMap.value = ltexture;
    that.lMaterial.uniforms.textureMap.value = ltexture;
    that.lMaterial.needsUpdate = true;
  }

  if(ltexture) {
    set();
  }
  else {
    new THREE.TextureLoader().load('/assets/letters/textures/' + matcap + '.jpg', function(texture) {
      ltexture = texture;
      set();
    });
  }
};

module.exports = World3D;
