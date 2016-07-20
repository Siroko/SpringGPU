/**
 * Created by siroko on 6/27/16.
 */

var THREE = require('three');
var GamePads = function( scene, camera, effect ){

    this.scene = scene;
    this.camera = camera;
    this.effect = effect;

    this.intersectPoint = new THREE.Vector3();
    this.intersectPoint2 = new THREE.Vector3();
    this.sTSMat = new THREE.Matrix4();

    this.h1 = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1, 1, 1, 1), new THREE.MeshNormalMaterial() );
    this.h1.matrixAutoUpdate = false;
    this.h2 = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1, 1, 1, 1), new THREE.MeshNormalMaterial() );
    this.h2.matrixAutoUpdate = false;
    this.handlers = [ this.h1, this.h2 ];

    this.scene.add( this.h1 );
    this.scene.add( this.h2 );

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

            if ("vibrate" in gamepad) {
              for (var j = 0; j < gamepad.buttons.length; ++j) {
                     if (gamepad.buttons[j].pressed) {
                       console.log(i);
                     }
                   }

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
            }
        }
    }
};

module.exports = GamePads;
