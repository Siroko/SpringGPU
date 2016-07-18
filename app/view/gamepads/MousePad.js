/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');

var MousePad = function( scene, camera ) {

    this.raycaster = new THREE.Raycaster();
    this.screenVector = new THREE.Vector2( 0, 0 );

    this.scene = scene;
    this.camera = camera;
    this.intersectPoint = new THREE.Vector3();
    this.intersectPoint2 = new THREE.Vector3();

    this.addEvents();
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
    }
};

module.exports = MousePad;