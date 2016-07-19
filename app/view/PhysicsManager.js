
 /**
  * Created by jorgalga on July 18th 2015.
 */

var THREE = require('three');

var PhysicsManager = function() {
  this.world = new CANNON.World();
  //this.world.gravity.set(0, 0, -9.82); // m/s²
  this.world.gravity.set(0, 0, -0.05); // m/s²


  this.threeCannon = [];

  var radius = 0.5;
  // Create a sphere
  /*
  var radius = 0.5; // m
  this.sphereBody = new CANNON.Body({
     mass: 5, // kg
     position: new CANNON.Vec3(0, 0, 10), // m
     shape: new CANNON.Sphere(radius)
  });
  this.world.addBody(this.sphereBody);
  */

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

  this.spring;
  this.springBodyA;
  this.springBodyB;
};

PhysicsManager.prototype.update = function(timestamp) {


  if(this.lastTime  !== undefined){
    var dt = (timestamp -   this.lastTime ) / 1000;
    this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
  }

  //Apply physics to three meshes

  for(i=0; i < this.threeCannon.length; i++){
    if(!this.threeCannon[i].c.isActuator){
      this.threeCannon[i].t.position.x = this.threeCannon[i].c.position.x ;
      this.threeCannon[i].t.position.y = this.threeCannon[i].c.position.z ; //XY coordinates flipped
      this.threeCannon[i].t.position.z = this.threeCannon[i].c.position.y ; //XY coordinates flipped

      this.threeCannon[i].t.quaternion.x = this.threeCannon[i].c.quaternion.x ;
      this.threeCannon[i].t.quaternion.y = this.threeCannon[i].c.quaternion.z ; //XY coordinates flipped
      this.threeCannon[i].t.quaternion.z = this.threeCannon[i].c.quaternion.y ; //XY coordinates flipped
      this.threeCannon[i].t.quaternion.w = this.threeCannon[i].c.quaternion.w ;
    }
    else{
      //console.log(this.threeCannon[i].c.velocity);

      this.threeCannon[i].c.position.x = this.threeCannon[i].t.position.x;
      this.threeCannon[i].c.position.z = this.threeCannon[i].t.position.y;
    }
  }

  if(this.spring !== undefined){
    this.spring.applyForce();
  }



  this.lastTime = timestamp;
};

/**
 * Add Cannon physics to a three.js object
 * @param {Object} obj - Three.js Object
 * @param {string} author - bounding geometry for physics calculations.
 * @param {boolean} actuator - The object is used for interacting so the mass is 0
 */
PhysicsManager.prototype.add3DObject = function(obj,type,actuator) {
  if(actuator==true){var mass = 0;}else{var mass = 5;}
  switch (type) {
    case "cube":

      var bbox = new THREE.Box3().setFromObject(obj);

      var widthX = bbox.max.x - bbox.min.x;
      var widthY = bbox.max.y - bbox.min.y;
      var widthZ = bbox.max.z - bbox.min.z;

      var boxShape = new CANNON.Box(new CANNON.Vec3(widthX/2,widthZ/2,widthY/2));  // Cannon and three have the XY coordinates flipped
      var boxBody = new CANNON.Body({ mass: mass });
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
      this.world.addBody(boxBody);
      boxBody.isActuator = actuator;
      this.threeCannon.push({"t":obj,"c":boxBody});
      break;
    case "sphere":

      var bbox = new THREE.Box3().setFromObject(obj);
      var radius = bbox.max.x - bbox.min.x; //We assume that the shape is uniform
      var boxShape = new CANNON.Sphere(radius/2);
      var boxBody = new CANNON.Body({ mass: mass });
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped
      this.world.addBody(boxBody);
      boxBody.isActuator = actuator;
      if(actuator==true){
        this.springBodyA = boxBody;
        this.springBodyB = this.threeCannon[0].c;
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

  console.log(bbox);

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

  console.log(groundBody);

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
  groundBody.position.set(0,0,widthY/2);
  this.world.addBody(groundBody);
};

PhysicsManager.prototype.springTest = function() {

  this.spring = new CANNON.Spring(this.springBodyA,this.springBodyB,{
    localAnchorA: new CANNON.Vec3(0,0,-1),
    localAnchorB: new CANNON.Vec3(0,0,0),
    restLength : 0,
    stiffness : 50,
    damping : 1,
  });

};

module.exports = PhysicsManager;
