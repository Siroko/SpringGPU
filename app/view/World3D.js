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


var World3D = function( container ) {

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
    this.phManager.add3DObject(this.cubetest,"cube",false,false);
    this.scene.add( this.cubetest );


    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshNormalMaterial(  );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.y = 10;
    this.phManager.add3DObject(cube,"cube",false,false);
    this.scene.add( cube );

    //this.phManager.addToSpring();

    //Adding ground
    /*
    geometry = new THREE.BoxGeometry(20,20);
    material = new THREE.MeshNormalMaterial(  );
    var ground = new THREE.Mesh( geometry, material );
    ground.rotation.x = Math.PI/2;
    this.scene.add( ground );
    */


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

        this.phManager.add3DObject(mesh,"sphere",false,true);
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

module.exports = World3D;
