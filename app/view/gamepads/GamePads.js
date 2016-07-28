/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');
var OBJLoader = require('./../../utils/OBJLoader');
var that;
var GamePads = function( scene, camera, effect , physics){
    that = this;

    this.scene = scene;
    this.camera = camera;
    this.effect = effect;
    this.phManager = physics;

    this.intersectPoint = new THREE.Vector3();
    this.intersectPoint2 = new THREE.Vector3();
    this.sTSMat = new THREE.Matrix4();

    this.h1 = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1, 1, 1, 1), new THREE.MeshNormalMaterial() );
    this.h2 = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1, 1, 1, 1), new THREE.MeshNormalMaterial() );



    // instantiate a loader
    var loader = new OBJLoader();
    // load a resource
    loader.load(
    	// resource URL
    	'assets/obj/hand-free2.obj',
    	// Function when resource is loaded
    	function ( object ) {

        var textureLoader = new THREE.TextureLoader();

        var tex = textureLoader.load("assets/textures/handocclusion.png");
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        object.children[0].material = new THREE.MeshBasicMaterial();
        object.children[0].material.map = tex;
        object.children[0].material.side = THREE.DoubleSide;
        object.children[0].material.needsUpdate = true;
        object.children[0].geometry.scale( 0.01, 0.01, 0.01 );
        object.children[0].geometry.rotateY(Math.PI);

        object.children[0].geometry.computeBoundingBox();

        that.h1 = object.children[0];

        var h2c = new THREE.Mesh(object.children[0].geometry.clone(),object.children[0].material.clone());
        h2c.geometry.scale( -1, 1, 1 );
        that.h2 = h2c ;

        that.h1.matrixAutoUpdate = false;
        that.h2.matrixAutoUpdate = false;
        that.handlers = [ that.h1, that.h2 ];

        that.scene.add(that.h1);
        that.scene.add(that.h2);
        that.phManager.add3DObject(that.h1, "cube", true,false);
        that.phManager.add3DObject(that.h2, "cube", true,false);

    	}
    );
    /*
    this.h1.matrixAutoUpdate = false;
    this.h2.matrixAutoUpdate = false;
    this.handlers = [ this.h1, this.h2 ];
    this.scene.add( this.h1 );
    this.scene.add( this.h2 );
    */

    this.cursorlocked = [];
    this.cursorlocked[0] = false;
    this.cursorlocked[1] = false;
    this.triggerlocked = [];
    this.triggerlocked[0] = false;
    this.triggerlocked[1] = false;

};

GamePads.prototype.update = function( t ){


    // Loop over every gamepad and if we find any that have a pose use it.
    var vrGamepads = [];
    var gamepads = navigator.getGamepads();

    if( this.effect.getHMD() ) {
        if( this.effect.getHMD().stageParameters ) {
            this.sTSMat.fromArray(this.effect.getHMD().stageParameters.sittingToStandingTransform);
        }
    }

    for (var i = 0; i < gamepads.length; ++i) {

        var gamepad = gamepads[i];

        // The array may contain undefined gamepads, so check for that as
        // well as a non-null pose.
        if (gamepad && gamepad.pose) {
            vrGamepads.push(gamepad);
            //this.intersectPoint.quaternion.fromArray( gamepad.pose.orientation );
            this.handlers[ i ].position.fromArray( gamepad.pose.position );



            this.handlers[ i ].quaternion.fromArray( gamepad.pose.orientation );
            this.handlers[ i ].updateMatrix();
            this.handlers[ i ].applyMatrix( this.sTSMat );

            this.intersectPoint.copy( this.handlers[ 0 ].position );
            this.intersectPoint2.copy( this.handlers[ 1 ].position );


            if (gamepad.buttons[0].pressed) {
              if(this.cursorlocked[i]==false){
                this.cursorlocked[i]=true;
                console.log("cursor locked");
                this.phManager.onCursor(-1);
              }
            }
            else{
              if(this.cursorlocked[i]==true){
                this.cursorlocked[i]=false;
                console.log("cursorunlocked");
              }
            }
            //Trigger
            if (gamepad.buttons[1].pressed) {
              if(this.triggerlocked[i]==false){
                this.triggerlocked[i]=true;
                console.log("Trigger locked");
                this.phManager.onClick();
              }
            }
            else{
              if(this.triggerlocked[i]==true){
                this.triggerlocked[i]=false;
                console.log("Trigger unlocked");
              }
            }


            //if ("vibrate" in gamepad) {
            //    for (var j = 0; j < gamepad.buttons.length; ++j) {
            //        if (gamepad.buttons[j].pressed) {
            //            //gamepad.vibrate(1000);
            //            // Vibrate the gamepad relative to the amount the button is pressed.
            //            var vibrationDelay = (500 * (1.0 - gamepad.buttons[j].value)) + 100;
            //            if (t - lastVibration > vibrationDelay) {
            //                gamepad.vibrate(100);
            //                lastVibration = t;
            //            }
            //            break;
            //        }
            //    }
            //}
        }
    }
};

module.exports = GamePads;
