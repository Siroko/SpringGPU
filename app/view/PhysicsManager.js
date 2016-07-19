
 /**
  * Created by jorgalga on July 18th 2015.
 */

var THREE = require('three');

var PhysicsManager = function() {
  this.world = new CANNON.World();
  this.world.gravity.set(0, 0, -9.82); // m/s²

  this.threeCannon = [];

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

  //Apply physics to three meshes

  for(i=0; i < this.threeCannon.length; i++){
    this.threeCannon[i].t.position.x = this.threeCannon[i].c.position.x ;
    this.threeCannon[i].t.position.y = this.threeCannon[i].c.position.z ; //XY coordinates flipped
    this.threeCannon[i].t.position.z = this.threeCannon[i].c.position.y ; //XY coordinates flipped
  }


  this.lastTime = timestamp;
};

PhysicsManager.prototype.add3DObject = function(obj,type) {
  switch (type) {
    case "cube":

      console.log(obj);
      var mass = 5;
      var boxShape = new CANNON.Box(new CANNON.Vec3(1,1,1));

      var boxBody = new CANNON.Body({ mass: mass });
      boxBody.addShape(boxShape);
      boxBody.position.set(obj.position.x,obj.position.z,obj.position.y); // Cannon and three have the XY coordinates flipped

      this.world.addBody(boxBody);

      this.threeCannon.push({"t":obj,"c":boxBody});


      break;
    default:

  }
}


module.exports = PhysicsManager;
