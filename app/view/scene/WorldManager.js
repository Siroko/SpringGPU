/**
 * Created by siroko on 7/19/16.
 */

var THREE = require( 'three' );
var OBJLoader = require('./../../utils/OBJLoader');

var vs_bufferGeometry   = require('./../../glsl/vs-buffer-geometry.glsl');
var fs_bufferGeometry   = require('./../../glsl/fs-buffer-geometry.glsl');

var vs_environment      = require('./../../glsl/vs-environment.glsl');
var fs_environment      = require('./../../glsl/fs-environment.glsl');

var WorldManager = function(){

    THREE.EventDispatcher.call( this );

    this.room = null;
    this.floor = null;
    this.meshes = [];
    this.materials = [];

    this._init();

};

// Inherits from eventdispatcher in order to be able to dispatch events from this class
WorldManager.prototype = Object.create( THREE.EventDispatcher.prototype );

WorldManager.prototype._init = function() {

    this._loadAssets();

};

WorldManager.prototype._loadAssets = function() {

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2 ) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    var objLoader = new OBJLoader();
    objLoader.setPath( 'assets/obj/' );
    objLoader.load( 'enviro.obj', (function ( object ) {

        var texturePattern = THREE.ImageUtils.loadTexture('assets/textures/patt2.png' );
        texturePattern.wrapS = THREE.RepeatWrapping;
        texturePattern.wrapT = THREE.RepeatWrapping;
        texturePattern.repeat.x = 1000;
        texturePattern.repeat.y = 1000;

        this.room = object.children[ 0 ];
        this.room.material = new THREE.RawShaderMaterial( {
            uniforms: {
                map             : { type : 't', value : THREE.ImageUtils.loadTexture('assets/textures/baked_ao.png' ) },
                uPatternMap     : { type : 't', value : texturePattern }
            },

            vertexShader                : vs_environment,
            fragmentShader              : fs_environment
        } );

        this._createGeometries();


    } ).bind( this ), onProgress, onError );

};

WorldManager.prototype._createFloor = function() {
    this.floor = new THREE.Object3D();
    this.floor.rotation.x = -Math.PI / 2;

    // create floor
    var infiniteFloorGeo = new THREE.PlaneBufferGeometry(100, 100);
    var infiniteFloorMat = new THREE.MeshBasicMaterial({ color: '#1a1f27' });
    var infiniteFloorMesh = new THREE.Mesh(infiniteFloorGeo, infiniteFloorMat);
    this.floor.add(infiniteFloorMesh);

    var centerFloorGeo = new THREE.PlaneBufferGeometry(3, 3);
    var centerFloorMat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load('assets/textures/floor.png'),
      transparent: true
    });

    var centerFloorMesh = new THREE.Mesh(centerFloorGeo, centerFloorMat);
    centerFloorMesh.position.z = 0.01;
    this.floor.add(centerFloorMesh);
};

WorldManager.prototype._createShapes = function() {
    var quantity = 100;
    var sizeBase = 0.2;
    var radius = [];
    var scales = [];
    var positions = [];

    var boxsize= 20;

    for ( var i = 0; i < quantity; i++ ) {

        var s = ( Math.random() * 2 ) + 0.1;


        var rdx = Math.floor(Math.random() * boxsize*2) - boxsize;
        var rdy = Math.floor(Math.random() * boxsize/2);
        var rdz = Math.floor(Math.random() * boxsize*2) - boxsize;

        //var p = new THREE.Vector3( ( Math.random() * 2 - 1) * 4.5, Math.random() * 4.5 + 4, ( Math.random() * 2 - 1 ) * 9 );

        var p = new THREE.Vector3( rdx,rdy, rdz );



        positions.push( p );
        radius.push( sizeBase * s );
        scales.push( s );
    }

    var shapesMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0 },
        timeOffset: { type: 'f', value: 0 }
      },
      vertexShader: require('../../glsl/vs-shape.glsl'),
      fragmentShader: require('../../glsl/fs-shape.glsl')
    });


    var geom = new THREE.IcosahedronGeometry( sizeBase, 2 );

    var mesh;
    for ( var i = 0; i < positions.length; i++ ) {

        var r = Math.round( Math.random() * 3 );

        var newMat = shapesMaterial.clone();
        newMat.uniforms.time.value = 0;
        newMat.uniforms.timeOffset.value = Math.random();
        this.materials.push(newMat);

        mesh = new THREE.Mesh( geom, newMat);
        mesh.position.copy( positions[ i ] );

        var s = scales[ i ];
        mesh.scale.set( s*0.5, s*0.5, s*0.5 );
        this.meshes.push( mesh );


    }
};

WorldManager.prototype._createGeometries = function() {

    this._createFloor();
    this._createShapes();

    this.dispatchEvent( { type : 'assetsLoaded' } );

};


WorldManager.prototype.update = function( t ) {
  for(var i = 0; i < this.materials.length; ++i) {
    this.materials[i].uniforms.time.value += 0.01;
  }
};

module.exports = WorldManager;
