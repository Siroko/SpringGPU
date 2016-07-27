/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');
var OBJLoader = require('./../../utils/OBJLoader');
var that;
var MousePad = function( scene, camera, effect,physics ) {
    that = this;

    this.raycaster = new THREE.Raycaster();
    this.screenVector = new THREE.Vector2( 0, 0 );

    this.scene = scene;
    this.camera = camera;

    this.phManager = physics;
    this.intersectPoint = new THREE.Vector3();
    this.intersectPoint2 = new THREE.Vector3();

    this.h1 = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1, 1, 1, 1), new THREE.MeshNormalMaterial() );

    // instantiate a loader
    var loader = new OBJLoader();
    // load a resource
    loader.load(
    	// resource URL
    	'assets/obj/hand-free.obj',
    	// Function when resource is loaded
    	function ( object ) {

        object.children[0].material = new THREE.MeshNormalMaterial();
        object.children[0].material.side = THREE.DoubleSide;
        object.children[0].material.needsUpdate = true;
        object.children[0].geometry.scale( 0.02, 0.02, 0.02 );
        object.children[0].rotation.y += Math.PI;
        object.children[0].geometry.computeBoundingBox();

        that.h1 = object.children[0];

        console.log(that.h1);

        that.scene.add(that.h1);
        that.phManager.add3DObject(that.h1, "cube", true,false);
        that.addEvents();
    	}
    );
    //this.scene.add(this.h1);
    //this.addEvents();

};


MousePad.prototype.addEvents = function(){
    this.mouseMoveHandler = this.onMouseMove.bind( this )
    window.addEventListener('mousemove', this.mouseMoveHandler );
    window.addEventListener('touchend', this.onTouchEnd.bind( this ) );

};

MousePad.prototype.onMouseMove = function( e ){

     this.screenVector.x = (e.clientX / window.innerWidth) * 2 - 1;
     this.screenVector.y = (1 - (e.clientY / window.innerHeight)) * 2 - 1;

};

MousePad.prototype.onTouchEnd = function( e ){

    window.removeEventListener('mousemove', this.mouseMoveHandler );

    this.screenVector.x = 0;
    this.screenVector.y = 0;
};



MousePad.prototype.update = function( t, objs ) {

    this.raycaster.setFromCamera(this.screenVector, this.camera);

    var intersects = this.raycaster.intersectObjects( objs );
    if (intersects.length > 0) {

        this.intersectPoint.copy(intersects[0].point);
        this.intersectPoint2.copy(intersects[0].point);
        this.h1.position.copy(intersects[0].point);


    }


};

module.exports = MousePad;
