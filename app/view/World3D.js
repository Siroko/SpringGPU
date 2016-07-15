/**
 * Created by siroko on 7/8/15.
 */
var THREE = require('three');
var OBJLoader = require('./../utils/OBJLoader');
var Simulator = require('./../utils/Simulator');
var GPUDisplacedGeometry = require('./../utils/GPUDisplacedGeometry');
var CameraControl = require('./../utils/CameraControl');

var World3D = function( container ) {

    this.container      = container;

    this.camera         = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.layers.enable( 1 );

    this.scene          = new THREE.Scene();
    //this.scene.fog      = new THREE.Fog( 0xefd1b5, 100, 1000);

    this.renderer       = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.cameraControl = new CameraControl( this.camera, this.scene.position );

    this.simulator = new Simulator({
        sizeW: 8,
        sizeH: 8,
        pointSize: 2,
        renderer: this.renderer
    });

    this.scene.add( this.simulator.bufferMesh );

    this.planeCalc = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100, 2, 2 ) , new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0
    }) );
    //this.planeCalc.rotation.x = Math.PI * 1.5;
    this.scene.add( this.planeCalc );
    this.onInitializeManager();
};

World3D.prototype.setup = function() {

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    var objLoader = new OBJLoader();
    objLoader.setPath( 'assets/obj/' );
    objLoader.load( 'mask.obj', (function ( object ) {

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
                'normalMap'     : { type: 't', value: THREE.ImageUtils.loadTexture( 'assets/matcaps/MatCap_00.jpg' ) },
                'textureMap'    : { type: 't', value: THREE.ImageUtils.loadTexture( 'assets/matcaps/MatCap_00.jpg' ) }
            }
        });

        this.mask = this.displacedGeometry.mesh;
        this.mask.position.set( 0, -10 , 0 );
        this.mask.scale.set( 0.5, 0.5 , 0.5 );

        this.scene.add( this.mask );

    } ).bind( this ), onProgress, onError );

    this.render( 0 );
};


World3D.prototype.addEvents = function() {

};

World3D.prototype.onInitializeManager = function( n, o ) {

    this.pointer = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.1, 10, 10), new THREE.MeshNormalMaterial() );

    this.scene.add( this.pointer );

    this.setup();
};

World3D.prototype.render = function( timestamp ) {

    window.requestAnimationFrame( this.render.bind( this ) );

    if( this.mask ) {
        this.planeCalc.lookAt( this.camera.position );
        this.cameraControl.getIntersects( [ this.planeCalc, this.mask ] );
        this.worldPosition.copy( this.mask.position );
        this.displacedGeometry.updateSpringMaterial.uniforms.uTime.value = timestamp;
        this.displacedGeometry.updateSpringMaterial.uniforms.uTouch.value = [ this.cameraControl.intersectPoint, this.cameraControl.intersectPoint ];
        this.displacedGeometry.updateSpringMaterial.uniforms.uWorldPosition.value = this.worldPosition;

        this.displacedGeometry.update();
    }

    this.pointer.position.copy( this.cameraControl.intersectPoint );

    this.cameraControl.update();
    this.simulator.update();
    // Render the scene through the manager.
    this.renderer.setClearColor( 0x202020 );
    this.renderer.render( this.scene, this.camera );

};

World3D.prototype.onResize = function( w, h ) {

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

};

module.exports = World3D;
