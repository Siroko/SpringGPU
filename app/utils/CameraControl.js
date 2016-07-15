/**
 * Created by felixmorenomartinez on 16/02/14.
 */

var THREE = require('three');

function CameraControl( camera, target )
{
    this.camera = camera;
    this.target = target;
    this.events();

    this.onMove = null;
}

// Clase que se encarga de gestionar una camara
// en coordenadas esfericas controlada con drag del ratón.

CameraControl.prototype = {

    constructor :        CameraControl,
    camera :            null,
    target :            null,
    displacement :      { x : 0, y : 0 },
    prevAngles :        { x : 0, y : 0.03 },
    currentAngles :     { x : 0, y : 0.03 },
    finalRadians :      { x : 0, y : 0.03 },
    downPoint :         { x : 0, y : 0 },
    down :              false,
    PI :                3.14159265359,
    radius :            10,
    wheelDelta :        10,
    limits :            { up : 0.2, down : 0.008 },
    planeIntersect :    null,
    currentPointIntersect: new THREE.Vector3( -10, 0, 0 ),
    mouseX : -1,
    mouseY: -1,
    _mouseX : -1,
    _mouseY: -1,
    _prevMouseX : -1,
    _prevMouseY: -1,
    mouseDistance : 0,
    touch : false,
    moving: false,

    raycaster : new THREE.Raycaster(),
    screenVector : new THREE.Vector2( 0, 0 ),
    intersectPoint : new THREE.Vector3(),

    events : function() {

        var mouseWheelEvent = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

        document.addEventListener( mouseWheelEvent, this.onMouseWheel.bind( this ) );
        window.addEventListener( 'mousedown', this.onMouseDown.bind( this ) );
        window.addEventListener( 'mouseup', this.onMouseUp.bind( this ) );
        window.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );

        window.addEventListener('touchstart', this.onTouchStart.bind( this ) );
        window.addEventListener('touchend', this.onTouchEnd.bind( this ) );
        window.addEventListener('touchmove', this.onTouchMove.bind( this ) );

    },

    onTouchStart : function( e ) {
        e.preventDefault();
        var ev = { pageX : e.changedTouches[0].pageX, pageY: e.changedTouches[0].pageY };
        ev.preventDefault = function(){};
        this.onMouseDown( ev );
        this.touch = true;
    },

    onTouchEnd : function( e ) {
        e.preventDefault();
        var ev = { pageX : e.changedTouches[0].pageX, pageY: e.changedTouches[0].pageY };
        ev.preventDefault = function(){};
        this.onMouseUp( ev );
        this.touch = false;
    },

    onTouchMove : function( e ) {

        e.preventDefault();

        var ev = { pageX : e.changedTouches[ 0 ].pageX, pageY: e.changedTouches[0].pageY };
        ev.preventDefault = function(){};

        this.onMouseMove( ev );
    },

    onMouseWheel : function( e ) {
        var delta = e.detail ? e.detail * -120 : e.wheelDelta;
        this.wheelDelta -= delta * 0.001;

        this._mouseX = e.pageX;
        this._mouseY = e.pageY;
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
        this._prevMouseX = this.mouseX;
        this._prevMouseY = this.mouseY;
    },

    onMouseDown : function( e ) {
        e.preventDefault();
        this.down = true;
        this.downPoint.x = e.pageX;
        this.downPoint.y = e.pageY;
    },

    onMouseUp : function( e ) {
        e.preventDefault();
        this.down = false;

        this.prevAngles.x = this.currentAngles.x;
        this.prevAngles.y = this.currentAngles.y;

        this._mouseX = e.pageX;
        this._mouseY = e.pageY;
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
        this._prevMouseX = this.mouseX;
        this._prevMouseY = this.mouseY;

    },

    onMouseMove : function( e ) {

        e.preventDefault();

        if( this.down ) {

            this.displacement.x = ( this.downPoint.x - e.pageX ) / window.innerWidth;
            this.displacement.y = ( this.downPoint.y - e.pageY ) / window.innerHeight;

            this.currentAngles.x = ( this.prevAngles.x + this.displacement.x );
            this.currentAngles.y = ( this.prevAngles.y - this.displacement.y );

            if( Math.abs(this.displacement.x) > 0.001 || Math.abs(this.displacement.x) > 0.001) this.moving = true;

            //Check if outside limits
            if( this.currentAngles.y > this.limits.up ) {
                this.currentAngles.y = this.prevAngles.y = this.limits.up;
                this.downPoint.y = e.pageY;
            }

            if( this.currentAngles.y < this.limits.down ) {
                this.currentAngles.y = this.prevAngles.y = this.limits.down;
                this.downPoint.y = e.pageY;
            }

        } else {
            this._mouseX = e.pageX;
            this._mouseY = e.pageY;
        }

        if( this.onMove) this.onMove();

        this.screenVector.x = (e.pageX / window.innerWidth) * 2 - 1;
        this.screenVector.y = (1 - (e.pageY / window.innerHeight)) * 2 - 1;

    },

    update : function()
    {
        // Interpolamos los radianes en x y en y
         this.finalRadians.x += ( this.currentAngles.x * this.PI * 2 - this.finalRadians.x ) / 5;
         this.finalRadians.y += ( this.currentAngles.y * this.PI * 2 - this.finalRadians.y ) / 5;
        //this.finalRadians.x = this.currentAngles.x * this.PI * 2;
        //this.finalRadians.y = this.currentAngles.y * this.PI * 2;

        this.radius += ( this.wheelDelta - this.radius ) / 5;
        //this.radius = this.wheelDelta;
        this.camera.position.x = this.target.x + ( Math.sin( this.finalRadians.x ) * Math.cos( this.finalRadians.y ) * this.radius );
        this.camera.position.z = this.target.z + ( Math.cos( this.finalRadians.x ) * Math.cos( this.finalRadians.y ) * this.radius );
        this.camera.position.y = this.target.y + ( Math.sin( this.finalRadians.y ) * this.radius );

        this.camera.lookAt( this.target );

        this.mouseX += (this._mouseX - this.mouseX) / 10;
        this.mouseY += (this._mouseY - this.mouseY) / 10;

        this._prevMouseX = this.mouseX;
        this._prevMouseY = this.mouseY;


        this.raycaster.setFromCamera(this.screenVector, this.camera);
    },

    getIntersects : function( objs ){

        var intersects = this.raycaster.intersectObjects( objs );
        if (intersects.length > 0) {
            this.intersectPoint.copy(intersects[0].point);
        }
    }
};

module.exports = CameraControl;
