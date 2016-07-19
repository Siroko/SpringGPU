/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');

var VRControls = require('./../utils/VRControls');
var VREffect = require('./../utils/VREffect');

var OBJLoader = require('./../utils/OBJLoader');
var Simulator = require('./../utils/Simulator');
var GPUDisplacedGeometry = require('./../utils/GPUDisplacedGeometry');
var CameraControl = require('./../utils/CameraControl');
var ImprovedNoise = require('./../utils/ImprovedNoise');

var GamePads = require('./gamepads/GamePads');
var MousePad = require('./gamepads/MousePad');

var PhysicsManager = require('./PhysicsManager');

var World3D = function( container ) {

    this.matcaps = [
        THREE.ImageUtils.loadTexture('assets/matcaps/brass.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/emerald.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/lit-sphere-matball-example.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/MatCap_00.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/matcap_blue_reflect.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/matcap_purple.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/matcap1.jpg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/skinmatcap.jpeg'),
        THREE.ImageUtils.loadTexture('assets/matcaps/yellowmatcap.png')
    ];
    this.container      = container;
    this.phManager       = new PhysicsManager();

    this.camera         = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.layers.enable( 1 );
    this.dummyCamera = new THREE.Object3D();
    this.dummyCamera.add( this.camera );

    this.scene          = new THREE.Scene();
    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );

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
    this.addEvents();

    // Creating the simulator for the particle system
    this.simulator = new Simulator({
        sizeW: 8,
        sizeH: 8,
        pointSize: 2,
        renderer: this.renderer
    });
    // Add mesh with the simulation
    this.scene.add( this.simulator.bufferMesh );

    // Create plane to raycast
    this.planeCalc = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100, 2, 2 ) , new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0
    }) );

    this.scene.add( this.planeCalc );
    this.scene.add( this.dummyCamera );

};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    var objLoader = new OBJLoader();
    objLoader.setPath( 'assets/obj/' );
    objLoader.load( 'mask_high.obj', (function ( object ) {

        this.positionTouch1 = new THREE.Vector3(0, 100, 0);
        this.positionTouch2 = new THREE.Vector3(0, 100, 0);

        this.worldPosition = new THREE.Vector3();

        this.displacedGeometry = new GPUDisplacedGeometry({
            'renderer'          : this.renderer,
            'geom'              : object.children[ 0 ].geometry,
            'uniforms'          : {
                'uTime'         : { type: 'f', value: 0 },
                'uTouch'        : { type: 'v3v', value: [ this.positionTouch1, this.positionTouch2 ] },
                'uWorldPosition': { type: 'v3', value: this.worldPosition },
                'normalMap'     : { type: 't', value: this.matcaps[2] },
                'textureMap'    : { type: 't', value: this.matcaps[2] }
            }
        });

        this.mask = this.displacedGeometry.mesh;
        this.mask.scale.set( 0.08, 0.08 , 0.08 );

        this.scene.add( this.mask );

        var objLoader2 = new OBJLoader();
        objLoader2.setPath( 'assets/obj/' );
        objLoader2.load( 'mask.obj', (function ( object ) {
            this.maskConvex = object.children[ 0 ];
            this.maskConvex.material.transparent = true;
            this.maskConvex.material.opacity= 0;
            //this.maskConvex.scale.set( 0.5, 0.5 , 0.5 );
            this.maskConvex.scale.set( 0.08, 0.08 , 0.08 );
            this.scene.add( this.maskConvex );

            this.render( 0 );
        } ).bind( this ), onProgress, onError );

    } ).bind( this ), onProgress, onError );

};

World3D.prototype.onModeChange = function( n, o ) {
    switch(n){
        case 3 :
            console.log('Passing to VR mode');
            break;
    }
};

World3D.prototype.addEvents = function() {
    this.manager.on('initialized', this.onInitializeManager.bind( this ) );
    this.manager.on('modechange', this.onModeChange.bind( this ) );
};

World3D.prototype.onInitializeManager = function( n, o ) {

    if( !this.manager.isVRCompatible || typeof window.orientation !== 'undefined' ) {
        this.gamePads = new MousePad( this.scene, this.camera, this.effect );
        this.dummyCamera.position.z = 1;
        this.dummyCamera.position.y = 1.6;
    } else {
        this.gamePads = new GamePads( this.scene, this.camera, this.effect );
    }

    this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.01, 10, 10), new THREE.MeshNormalMaterial() );

    this.scene.add( this.pointer );

    this.setup();
};

World3D.prototype.onRenderLeft = function() {
    console.log('rendering Left', this);

};

World3D.prototype.onRenderRight = function() {
    console.log('rendering Right', this);
};

World3D.prototype.render = function( timestamp ) {

    window.requestAnimationFrame( this.render.bind( this ) );

    this.planeCalc.lookAt( this.dummyCamera.position );

    this.gamePads.update( timestamp,[ this.maskConvex ] );

    this.worldPosition.copy( this.mask.position );
    this.displacedGeometry.updateSpringMaterial.uniforms.uTime.value = timestamp;
    this.displacedGeometry.updateSpringMaterial.uniforms.uTouch.value = [ this.gamePads.intersectPoint, this.gamePads.intersectPoint2 ];
    this.displacedGeometry.updateSpringMaterial.uniforms.uWorldPosition.value = this.worldPosition;

    this.displacedGeometry.update();

    var speed = 0.0001;
    var t = timestamp * speed;
    this.mask.rotation.x = this.maskConvex.rotation.x = ( ImprovedNoise().noise( t, -t ), 12 ) * 0.5;
    this.mask.rotation.z = this.maskConvex.rotation.z = ( ImprovedNoise().noise( 13, t, t ) ) * 0.5;

    this.mask.position.y = this.maskConvex.position.y = (ImprovedNoise().noise( 13, t, t ) ) * 0.5 + 2;
    this.mask.position.z = this.maskConvex.position.z = ImprovedNoise().noise( 1, -t, t );
    this.planeCalc.position.copy( this.maskConvex.position );
    this.worldPosition.copy( this.mask.position );

    this.pointer.position.copy( this.gamePads.intersectPoint );

    // Update VR headset position and apply to camera.
    this.controls.update();
    // Update the particles simulation
    this.simulator.update();

    // Render the scene through the manager.
    this.renderer.setClearColor( 0x202020 );
    this.renderer.setRenderTarget( null ); // add this line
    this.manager.render( this.scene, this.camera, timestamp);

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.effect.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

};

module.exports = World3D;
