
 /**
  * Created by jorgalga on July 18th 2015.
 */

var THREE = require('three');

var PhysicsManager = function() {
  this.world = new CANNON.World();
  this.world.gravity.set(0, 0, -9.82); // m/s²


  // Create a sphere
  var radius = 0.5; // m
  this.sphereBody = new CANNON.Body({
     mass: 5, // kg
     position: new CANNON.Vec3(0, 0, 10), // m
     shape: new CANNON.Sphere(radius)
  });
  this.world.addBody(this.sphereBody);

  // Create a plane
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane();
  groundBody.addShape(groundShape);
  this.world.addBody(groundBody);


  this.fixedTimeStep = 1.0 / 60.0; // seconds
  this.maxSubSteps = 3;
  this.lastTime = 0;

};

PhysicsManager.prototype.update = function(timestamp) {


  if(this.lastTime  !== undefined){
    var dt = (timestamp -   this.lastTime ) / 1000;
    this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
  }

  //console.log("Sphere z position: " + this.sphereBody.position.z);
  this.lastTime = timestamp;
};
module.exports = PhysicsManager;
