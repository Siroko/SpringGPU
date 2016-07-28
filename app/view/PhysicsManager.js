
 /**
  * Created by jorgalga on July 18th 2015.
 */

var THREE = require('three');
var TWEEN = require('tween.js');
var that;

var SoundManager = require('./sound/SoundManager');
var AssetsSound = require('./sound/AssetsSound');

var PhysicsManager = function(dcamera,camera) {

  that = this;
  THREE.EventDispatcher.call( this );

  this.world = new CANNON.World();
  //this.world.gravity.set(0, 0, -9.82);      // m/s²
  this.world.gravity.set(0, 0, 0); // m/s²

  this.dcamera = dcamera;
  this.camera = camera;
  this.mode = -1;


  this.threeCannon = [];

  console.log(dcamera.position);
  // Create a sphere for the dummyCamera
  var radius = 0.25;  // m
  this.camBody = new CANNON.Body({
     mass: 0, // kg

     shape: new CANNON.Sphere(radius)
  });
  this.world.addBody(this.camBody);


  // Create a planes
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });

  var groundShape = new CANNON.Plane();
  groundBody.addShape(groundShape);
  this.world.addBody(groundBody);

  this.fixedTimeStep = 1.0 / 60.0; // seconds
  this.maxSubSteps = 3;
  this.lastTime = 0;

  this.damping = 0.5;
  this.f = 10;

  this.spring;


  this.bodyText = [];
  this.setBodyText();
  this.springElements = [];

  this.startPh = false;
  this.startSpring;

  this.soundManager = new SoundManager();
  this.soundManager.addSounds(AssetsSound.Sounds);
  this.balloonSoundIndex = 0;

  this.lettersLength = 0;

  window.addEventListener('click', this.onClick.bind( this )  );
  window.addEventListener("keydown",  this.onCursor, true);
};

// Inherits from eventdispatcher in order to be able to dispatch events from this class
PhysicsManager.prototype = Object.create( THREE.EventDispatcher.prototype );

PhysicsManager.prototype.onClick = function( e ){
  this.attractBodiesToPlayer();
};

/**
 * @method attractToPlayer
 */
PhysicsManager.prototype.attractBodiesToPlayer = function() {
  for(var i=0; i<this.threeCannon.length; i++){

    if(this.mode == 3){
      var vx = this.camera.position.x - this.threeCannon[i].t.position.x;
      var vy = this.camera.position.y - this.threeCannon[i].t.position.y;
      var vz = this.camera.position.z - this.threeCannon[i].t.position.z;
    }
    else{
      var vx = this.dcamera.position.x - this.threeCannon[i].t.position.x;
      var vy = this.dcamera.position.y - this.threeCannon[i].t.position.y;
      var vz = this.dcamera.position.z - this.threeCannon[i].t.position.z;
    }


    var v = new CANNON.Vec3(vx, vz, vy);
    v.normalize();

    if(!this.threeCannon[i].c.isSpringing){
      this.threeCannon[i].c.applyLocalImpulse(v.scale(this.f/30), this.threeCannon[i].c.position);

      if(this.threeCannon[i].c.springable){
        v = v.scale(this.f/2);
      }
      else{
        v = v.scale(this.f/500);
      }

      //console.log(v);
      this.threeCannon[i].c.applyImpulse(v, this.threeCannon[i].c.position);
    }
  }
};

PhysicsManager.prototype.showMessage = function(  ){

      for(var i=0; i < that.threeCannon.length;i++){
        var body = that.threeCannon[i].c;

        if(!body.isSpringing && body.springable && !body.isStarter ){
          that.addToSpring(that.bodyText[body.springIndex],body);
        }
      }

};

PhysicsManager.prototype.onCursor= function( e ){

  if(that.startPh){
    if(e.keyCode==81 ){
        that.showMessage();
    }
    if(e.keyCode==32 || e == -1){
      if(that.springElements.length >= that.lettersLength){
        //console.log("unlock");
        that.dispatchEvent( { type : 'messageUnlocked' } );
      }

      for(var i=0; i < that.springElements.length; i++){
          that.springElements[i].bodyB.isSpringing = false;
      }
      that.springElements = [];


    }
  }

};

PhysicsManager.prototype.update = function(timestamp) {


  if(this.lastTime  !== undefined){
    var dt = (timestamp -   this.lastTime ) / 1000;
    this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
  }

  //Apply physics to three meshes
  if(this.mode == 3){
    this.camBody.position.x = this.camera.position.x;
    this.camBody.position.y = this.camera.position.z;
    this.camBody.position.z = this.camera.position.y;
  }
  else{
    this.camBody.position.x = this.dcamera.position.x;
    this.camBody.position.y = this.dcamera.position.z;
    this.camBody.position.z = this.dcamera.position.y;

  }




  for(i=0; i < this.threeCannon.length; i++){
    if(!this.threeCannon[i].c.isActuator){


          this.threeCannon[i].t.position.x = this.threeCannon[i].c.position.x ;
          this.threeCannon[i].t.position.y = this.threeCannon[i].c.position.z ; //XY coordinates flipped
          this.threeCannon[i].t.position.z = this.threeCannon[i].c.position.y ; //XY coordinates flipped



        if(!this.threeCannon[i].c.isSpringing){
          this.threeCannon[i].t.quaternion.x = this.threeCannon[i].c.quaternion.x ;
          this.threeCannon[i].t.quaternion.y = this.threeCannon[i].c.quaternion.z ; //XY coordinates flipped
          this.threeCannon[i].t.quaternion.z = this.threeCannon[i].c.quaternion.y ; //XY coordinates flipped
          this.threeCannon[i].t.quaternion.w = this.threeCannon[i].c.quaternion.w ;

        }
        else{
          if(this.threeCannon[i].c.waitsAnimation){
            this.threeCannon[i].c.waitsAnimation=false;
            this.animateQuaternion(this.threeCannon[i], 2000);
          }
          this.threeCannon[i].c.quaternion.x = this.threeCannon[i].t.quaternion.x;
          this.threeCannon[i].c.quaternion.y = this.threeCannon[i].t.quaternion.z; //XY coordinates flipped
          this.threeCannon[i].c.quaternion.z = this.threeCannon[i].t.quaternion.y; //XY coordinates flipped
          this.threeCannon[i].c.quaternion.w = this.threeCannon[i].t.quaternion.w;
        }

    }
    else{
      this.threeCannon[i].c.position.x = this.threeCannon[i].t.position.x;
      this.threeCannon[i].c.position.y = this.threeCannon[i].t.position.z;
      this.threeCannon[i].c.position.z = this.threeCannon[i].t.position.y;

      this.threeCannon[i].c.quaternion.x = this.threeCannon[i].t.quaternion.x;
      this.threeCannon[i].c.quaternion.y = this.threeCannon[i].t.quaternion.z; //XY coordinates flipped
      this.threeCannon[i].c.quaternion.z = this.threeCannon[i].t.quaternion.y; //XY coordinates flipped
      this.threeCannon[i].c.quaternion.w = this.threeCannon[i].t.quaternion.w;
    }
  }


  if(this.springElements.length >0 && this.startPh){
    for(var i=0; i<this.springElements.length; i++){
      this.springElements[i].applyForce();
    }
  }
  //if(!this.startPh){
  if(this.startSpring !== undefined){
    this.startSpring.applyForce();
  }
  //}




  this.lastTime = timestamp;
};


PhysicsManager.prototype.addStarterObject = function(obj,type) {
  var mass = 5;
  switch (type) {
    case "cube":
      var bbox = new THREE.Box3().setFromObject(obj);
      var widthX = bbox.max.x - bbox.min.x;
      var widthY = bbox.max.y - bbox.min.y;
      var widthZ = bbox.max.z - bbox.min.z;
      var boxShape = new CANNON.Box(new CANNON.Vec3(widthX/2,widthZ/2,widthY/2));  // Cannon and three have the XY coordinates flipped
      var boxBody;

      boxBody = new CANNON.Body({ mass: mass, angularDamping:0.3 });
      boxBody.springable = true;
      boxBody.isStarter = true;
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
      this.world.addBody(boxBody);

      var radius = 0.1;  // m
      var body  = new CANNON.Body({
         mass: 0, // kg
         position: new CANNON.Vec3(0,0,1.5),
         shape: new CANNON.Sphere(radius)
      });


      this.startSpring = new CANNON.Spring(body,boxBody,{
        localAnchorA: new CANNON.Vec3(0,0,-0.4),
        localAnchorB: new CANNON.Vec3(0,0,0),
        restLength : 0,
        stiffness : 50,
        damping : 40,
      });

      this.threeCannon.push({"t":obj,"c":boxBody});
    break;
  }
};

PhysicsManager.prototype.deleteStarterObject = function() {
  var cbody = that.startSpring.bodyB;
  var mesh = that.getThreeMeshFromCannonBody(this.startSpring.bodyB);
  mesh.material.transparent = true;

  new TWEEN.Tween({ opacity: mesh.material.opacity })
    .to({ opacity: 0 }, 1000)
    .onUpdate(function() {
      mesh.material.opacity = this.opacity;
    })
    .onComplete(function() {
      mesh.visible = false;
      cbody.sleep();
    })
    .start();

  this.startSpring = undefined;

};
/**
 * Add Cannon physics to a three.js object
 * @param {Object} obj - Three.js Object
 * @param {string} author - bounding geometry for physics calculations.
 * @param {boolean} actuator - The object is used for interacting so the mass is 0
 * @param {Objects} options - options object with the properties of the CANNON material
 * @param {boolean} springable - The object has an Spring interaction
 */
PhysicsManager.prototype.add3DObject = function(obj,type,actuator,springable,options) {

  if(actuator==true){var mass = 0;}else{var mass = 5;}
  switch (type) {
    case "cube":
      //console.log(obj);
      var bbox = new THREE.Box3().setFromObject(obj);
      var widthX = bbox.max.x - bbox.min.x;
      var widthY = bbox.max.y - bbox.min.y;
      var widthZ = bbox.max.z - bbox.min.z;
      var boxShape = new CANNON.Box(new CANNON.Vec3(widthX/2,widthZ/2,widthY/2));  // Cannon and three have the XY coordinates flipped
      var boxBody;
      if(options){
        boxBody = new CANNON.Body(options);
      }
      else{
        boxBody = new CANNON.Body({ mass: mass, angularDamping:0.3 });
      }
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
      this.world.addBody(boxBody);
      boxBody.springable = springable;
      boxBody.isActuator = actuator;
      boxBody.isSpringing = false;
      boxBody.springIndex = obj.springIndex;

      if(actuator==true){
        // When a body collides with another body, they both dispatch the "collide" event.
        boxBody.addEventListener("collide",function(e){

          if(!that.startPh && e.body.isStarter && that.lastTime > 1000){
              console.log("Interaction enabled");
              that.dispatchEvent( { type : 'starts' } );
              that.startPh = true;
              that.deleteStarterObject();
          }

          if(e.body.springable && !e.body.isSpringing && that.startPh){
            if(e.body.springIndex != undefined){
              that.addToSpring(that.bodyText[e.body.springIndex],e.body);
              that.onLetterHit(that.getThreeMeshFromCannonBody(e.body));
            }
          }
        });
      }
      this.threeCannon.push({"t":obj,"c":boxBody});

      break;
    case "sphere":

      var bbox = new THREE.Box3().setFromObject(obj);
      var radius = bbox.max.x - bbox.min.x; //We assume that the shape is uniform
      var boxShape = new CANNON.Sphere(radius/2);
      var boxBody;
      if(options){
        boxBody = new CANNON.Body(options);

      }
      else{
        boxBody = new CANNON.Body({ mass: mass, angularDamping:0.3 });
      }
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
      this.world.addBody(boxBody);
      boxBody.springable = springable;
      boxBody.isActuator = actuator;
      boxBody.springIndex = obj.springIndex;
      if(actuator==true){
        // When a body collides with another body, they both dispatch the "collide" event.
        boxBody.addEventListener("collide",function(e){
          console.log("Collided with body:",e.body);

        });
      }
      this.threeCannon.push({"t":obj,"c":boxBody});

      break;

      case "convex":

        var bbox = new THREE.Box3().setFromObject(obj);

        var widthX = bbox.max.x - bbox.min.x;
        var widthY = bbox.max.y - bbox.min.y;
        var widthZ = bbox.max.z - bbox.min.z;



        var verts=[];
        for(var i=0; i<obj.geometry.vertices.length; i++ ){
          verts.push(new CANNON.Vec3(obj.geometry.vertices[i].x,obj.geometry.vertices[i].z,obj.geometry.vertices[i].y));
        }
        var faces=[];
        for(var i=0; i<obj.geometry.faces.length; i++ ){
          faces.push([obj.geometry.faces[i].a,obj.geometry.faces[i].b,obj.geometry.faces[i].c]);
        }
        var boxShape = new CANNON.Trimesh(verts,faces);


        var boxBody;
        if(options){
          boxBody = new CANNON.Body(options);

        }
        else{
          boxBody = new CANNON.Body({ mass: mass, angularDamping:0.3 });

        }
        boxBody.addShape(boxShape);
        boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
        this.world.addBody(boxBody);
        boxBody.springable = springable;
        boxBody.isActuator = actuator;
        boxBody.isSpringing = false;
        boxBody.springIndex = obj.springIndex;

        if(actuator==true){
          // When a body collides with another body, they both dispatch the "collide" event.
          boxBody.addEventListener("collide",function(e){
            //console.log("Collided with body:",e.body);
            if(e.body.springable && !e.body.isSpringing){

              if(e.body.springIndex != undefined){
                that.addToSpring(that.bodyText[e.body.springIndex], e.body);
                that.onLetterHit(that.getThreeMeshFromCannonBody(e.body));
              }
            }
          });
        }
        this.threeCannon.push({"t":obj,"c":boxBody});

        break;


    default:
  }
}

var Explosion = require('./Explosion');

var availableExplosions = [];

/**
 * @method onLetterHit
 * @param {THREE.Mesh} letterMesh
 */
PhysicsManager.prototype.onLetterHit = function(letterMesh) {
  if(!letterMesh.inflateSpring) {
    return;
  }

  if(letterMesh.deflateTimeoutId) {
    window.clearTimeout(letterMesh.deflateTimeoutId);
  }


  // explosion
  var explosion = availableExplosions.length
    ? availableExplosions.pop()
    : new Explosion();

  var scene = letterMesh.parent;

  explosion.setParent(scene);
  explosion.el.position.copy(letterMesh.position);

  new TWEEN.Tween({ progress: 0 })
    .to({ progress: 1 }, 400)
    //.easing(TWEEN.Easing.Exponential.Out)
    .onUpdate(function() {
      explosion.setProgress(this.progress);
    })
    .onComplete(function() {
      availableExplosions.push(explosion);
      explosion.setParent(null);
    })
    .start();

  // inflate
  letterMesh.inflateSpring.setEndValue(0.09);

  letterMesh.deflateTimeoutId = window.setTimeout(function() {
    letterMesh.inflateSpring.setEndValue(0);
  }, 300);

  // sound
  this.balloonSoundIndex++;

  if(this.balloonSoundIndex >= 3) {
    this.balloonSoundIndex = 0;
  }

  //console.log(this.balloonSoundIndex);

  var sound;

  switch(this.balloonSoundIndex) {
    case 0:
      sound = AssetsSound.BALLOON_1;
      break;

    case 1:
      sound = AssetsSound.BALLOON_2;
      break;

    case 2:
      sound = AssetsSound.BALLOON_3;
      break;
  }

  this.soundManager.play(sound);
};

/**
 * @method getThreeMeshFromCannonBody
 * @param {CANNON.Body} body
 * @returns {THREE.Mesh}
 */
PhysicsManager.prototype.getThreeMeshFromCannonBody = function(body) {
  for(var i = 0; i < this.threeCannon.length; i++) {
    if(body.id === this.threeCannon[i].c.id) {
      return this.threeCannon[i].t;
    }
  }

  return;
};

PhysicsManager.prototype.setClosedArea = function(x,y,z) {
  //var bbox = new THREE.Box3().setFromObject(obj);
  var widthX = x;//bbox.max.x - bbox.min.x;
  var widthY = y;//bbox.max.y - bbox.min.y;
  var widthZ = z;//bbox.max.z - bbox.min.z;


  //4 walls and the roof (floor is already set up)

  //Left wall
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthZ,widthY);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(0,1,0)
  groundBody.quaternion.setFromAxisAngle(rot,(Math.PI/2))
  groundBody.position.set(-widthX/2,0,widthY/2);
  this.world.addBody(groundBody);
  //Right wall
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthZ,widthY);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(0,1,0)
  groundBody.quaternion.setFromAxisAngle(rot, -(Math.PI/2))
  groundBody.position.set(widthX/2,0,widthY/2);
  this.world.addBody(groundBody);

  //Front Wall
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthX,widthY);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(1,0,0)
  groundBody.quaternion.setFromAxisAngle(rot,-(Math.PI/2))
  groundBody.position.set(0,-widthZ/2,widthY/2);
  this.world.addBody(groundBody);

  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthX,widthY);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(1,0,0)
  groundBody.quaternion.setFromAxisAngle(rot,(Math.PI/2))
  groundBody.position.set(0,widthZ/2,widthY/2);
  this.world.addBody(groundBody);

  //Roof

  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthX,widthZ);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(0,1,0)
  groundBody.quaternion.setFromAxisAngle(rot,(Math.PI))
  groundBody.position.set(0,0,widthY);
  this.world.addBody(groundBody);
};

/**
 * @method addToSpring
 * @param {CANNON.Body} a
 * @param {CANNON.Body} b
 */
PhysicsManager.prototype.addToSpring = function(bodyA, bodyB) {
  // get the distance between the letter and the target
  var dx = bodyA.position.x - bodyB.position.x;
  var dy = bodyA.position.y - bodyB.position.y;
  var dz = bodyA.position.z - bodyB.position.z;

  var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

  bodyB.isSpringing = true;
  bodyB.waitsAnimation = true;

  var spring = new CANNON.Spring(bodyA, bodyB,{
    localAnchorA: new CANNON.Vec3(0, 0, -0.4),
    localAnchorB: new CANNON.Vec3(0, 0, 0),
    restLength : dist,
    stiffness : 50,
    damping : 40
  });


  that.springElements.push(spring);
  if(that.springElements.length >= that.lettersLength){
      //console.log("message done");
      that.dispatchEvent( { type : 'messageDone' } );
  }

  // shring the spring resting lenght to 0
  new TWEEN.Tween({ length: spring.restLength })
    .to({ length: 0 }, 2000)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onUpdate(function() {
      spring.restLength = this.length;
    })
    .start();

};

PhysicsManager.prototype.setMode = function(m) {
  this.mode = m;
};

PhysicsManager.prototype.setBodyText = function() {

  var sw = 10;
  var sh = 8;

  var px = -4.5;
  var pz = 9;

  //Grid 4 *11
  var rows = 4;
  var columns = 11;

  var ofsetW = sw/columns;
  var offsetH = sh/rows;


  for(var i=0; i <= rows ; i++){
    for(var j=0 ; j <= columns; j++){

      var radius = 0.1;  // m
      var body  = new CANNON.Body({
         mass: 0, // kg
         position: new CANNON.Vec3(px + ofsetW*j, -9, pz - offsetH*i),
         shape: new CANNON.Sphere(radius)
      });

      //console.log(this.bodyText.length,body.position);
      this.bodyText.push(body);

    }
  }
  /*
  //from 7 to 1 inclusive
  for(var iz = 7; iz >= 1; iz--){
    //From -4 to 4 inclusive
    for(var ix = -4 ; ix <= 4; ix++  ){
        var radius = 0.1;  // m
      var body  = new CANNON.Body({
         mass: 0, // kg
         position: new CANNON.Vec3(ix, -10, iz),
         shape: new CANNON.Sphere(radius)
      });
      //this.world.addBody(body);
      this.bodyText.push(body);
    }
  }
  */
}

/**
 * Animate quaternion to his 'resting' position.
 *
 * @method animateQuaternion
 * @param {any} obj
 * @param {float} duration
 */
PhysicsManager.prototype.animateQuaternion = function(obj, duration) {

  var startQuaternion = new THREE.Quaternion().copy(obj.t.quaternion).normalize();
  var endQuaternion = new THREE.Quaternion().set(0, 0, 0, 1).normalize();

  new TWEEN.Tween({ progress: 0 })
    .to({ progress: 1 }, duration)
    .onUpdate(function() {
      THREE.Quaternion.slerp(startQuaternion, endQuaternion, obj.t.quaternion, this.progress);
    })
    .start();
};

PhysicsManager.prototype.setLettersLength = function(n) {
  this.lettersLength = n;
}

module.exports = PhysicsManager;
