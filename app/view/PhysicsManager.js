
 /**
  * Created by jorgalga on July 18th 2015.
 */

var THREE = require('three');
var that;

var PhysicsManager = function(dcamera,camera) {

  that = this;

  this.world = new CANNON.World();
  //this.world.gravity.set(0, 0, -9.82);      // m/s²
  this.world.gravity.set(0, 0, 0); // m/s²

  this.dcamera = dcamera;
  this.camera = camera;
  this.mode = -1;


  this.threeCannon = [];

  // Create a sphere for the dummyCamera
  var radius = Math.abs(0.2);  // m
  this.camBody = new CANNON.Body({
     mass: 0, // kg
     position: new CANNON.Vec3(dcamera.position.x, dcamera.position.z, dcamera.position.y),
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
  this.bodyA;
  this.bodyB;

  this.bodyText = [];
  this.setBodyText();
  this.springElements = [];


  window.addEventListener('click', this.onClick.bind( this )  );
  window.addEventListener("keydown",  this.onCursor, true);
};

PhysicsManager.prototype.onClick = function( e ){
  //console.log(this.dcamera);

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
      this.threeCannon[i].c.applyLocalImpulse(v, this.threeCannon[i].c.position);
      v = v.scale(this.f);
      //console.log(v);
      this.threeCannon[i].c.applyImpulse(v, this.threeCannon[i].c.position);
    }
  }
};

PhysicsManager.prototype.onCursor= function( e ){

  for(var i=0; i < that.springElements.length; i++){
      that.springElements[i].bodyB.isSpringing = false;
  }
  that.springElements = [];
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

          this.animateQuaternion(this.threeCannon[i],2);
        }

        this.threeCannon[i].c.quaternion.x = this.threeCannon[i].t.quaternion.x;
        this.threeCannon[i].c.quaternion.y = this.threeCannon[i].t.quaternion.z; //XY coordinates flipped
        this.threeCannon[i].c.quaternion.z = this.threeCannon[i].t.quaternion.y; //XY coordinates flipped
        this.threeCannon[i].c.quaternion.w = this.threeCannon[i].t.quaternion.w;

      }
    }
    else{
      //console.log(this.threeCannon[i].c.velocity);

      this.threeCannon[i].c.position.x = this.threeCannon[i].t.position.x;
      this.threeCannon[i].c.position.y = this.threeCannon[i].t.position.z;
      this.threeCannon[i].c.position.z = this.threeCannon[i].t.position.y;


      this.threeCannon[i].c.quaternion.x = this.threeCannon[i].t.quaternion.x;
      this.threeCannon[i].c.quaternion.y = this.threeCannon[i].t.quaternion.z; //XY coordinates flipped
      this.threeCannon[i].c.quaternion.z = this.threeCannon[i].t.quaternion.y; //XY coordinates flipped
      this.threeCannon[i].c.quaternion.w = this.threeCannon[i].t.quaternion.w;


    }
  }

  if(this.springElements.length >0){
    for(var i=0; i<this.springElements.length; i++){
      this.springElements[i].applyForce();
    }
  }



  this.lastTime = timestamp;
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

      var bbox = new THREE.Box3().setFromObject(obj);

      var widthX = bbox.max.x - bbox.min.x;
      var widthY = bbox.max.y - bbox.min.y;
      var widthZ = bbox.max.z - bbox.min.z;
      var boxShape = new CANNON.Box(new CANNON.Vec3(widthX/2,widthZ/2,widthY/2));  // Cannon and three have the XY coordinates flipped
      var boxBody;
      if(options){
        boxBody = new CANNON.Body(options);
        this.bodyA = boxBody;
      }
      else{
        boxBody = new CANNON.Body({ mass: mass, angularDamping:0.3 });
        this.bodyB = boxBody;
      }
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
      this.world.addBody(boxBody);
      boxBody.springable = springable;
      boxBody.isActuator = actuator;
      boxBody.isSpringing = false;
      if(actuator==true){
        // When a body collides with another body, they both dispatch the "collide" event.
        boxBody.addEventListener("collide",function(e){
          //console.log("Collided with body:",e.body);
          if(e.body.springable && !e.body.isSpringing){
            that.addToSpring(that.bodyText[that.springElements.length],e.body);
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
      if(actuator==true){
        // When a body collides with another body, they both dispatch the "collide" event.
        boxBody.addEventListener("collide",function(e){
          console.log("Collided with body:",e.body);

        });
      }
      this.threeCannon.push({"t":obj,"c":boxBody});

      break;
    default:
  }
}
PhysicsManager.prototype.setClosedArea = function(obj) {
  var bbox = new THREE.Box3().setFromObject(obj);
  var widthX = bbox.max.x - bbox.min.x;
  var widthY = bbox.max.y - bbox.min.y;
  var widthZ = bbox.max.z - bbox.min.z;


  //4 walls and the roof (floor is already set up)

  //Left wall
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthZ/2,widthY/2);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(0,1,0)
  groundBody.quaternion.setFromAxisAngle(rot,(Math.PI/2))
  groundBody.position.set(-widthX/2,0,widthY/2);
  this.world.addBody(groundBody);
  //Right wall
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthZ/2,widthY/2);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(0,1,0)
  groundBody.quaternion.setFromAxisAngle(rot, -(Math.PI/2))
  groundBody.position.set(widthX/2,0,widthY/2);
  this.world.addBody(groundBody);

  //Front Wall
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthX/2,widthY/2);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(1,0,0)
  groundBody.quaternion.setFromAxisAngle(rot,-(Math.PI/2))
  groundBody.position.set(0,-widthZ/2,widthY/2);
  this.world.addBody(groundBody);

  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthX/2,widthY/2);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(1,0,0)
  groundBody.quaternion.setFromAxisAngle(rot,(Math.PI/2))
  groundBody.position.set(0,widthZ/2,widthY/2);
  this.world.addBody(groundBody);

  //Roof

  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane(widthX/2,widthZ/2);
  groundBody.addShape(groundShape);
  var rot = new CANNON.Vec3(0,1,0)
  groundBody.quaternion.setFromAxisAngle(rot,(Math.PI))
  groundBody.position.set(0,0,widthY);
  this.world.addBody(groundBody);
};

PhysicsManager.prototype.addToSpring = function(a,b) {
  b.isSpringing = true;
  b.waitsAnimation = true;

  setTimeout(function(){

    var spring = new CANNON.Spring(a,b,{
      localAnchorA: new CANNON.Vec3(0,0,-0.4),
      localAnchorB: new CANNON.Vec3(0,0,0),
      restLength : 0,
      stiffness : 50,
      damping : 40,
    });
    that.springElements.push(spring);

  }, 100);
};

PhysicsManager.prototype.setMode = function(m) {
  this.mode = m;
}
PhysicsManager.prototype.setBodyText = function() {
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
  this.bodyText
}

PhysicsManager.prototype.animateQuaternion = function(obj,t){
  var amount=0;
  //console.log("start");

  var startQuaternion = new THREE.Quaternion().copy( obj.t.quaternion ).normalize();
  var endQuaternion = new THREE.Quaternion().set( 0, 0, 0, 1 ).normalize();


  function set(t){
    amount += that.fixedTimeStep/t;

    THREE.Quaternion.slerp( startQuaternion, endQuaternion, obj.t.quaternion,amount );

    if(amount >=1){
      console.log("end");
    return;}
    else{
      setTimeout(function(){ set(t); }, 1000*that.fixedTimeStep);
    }
  }
  set(t);
};

module.exports = PhysicsManager;
