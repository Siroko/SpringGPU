
 /**
  * Created by jorgalga on July 18th 2015.
 */

var THREE = require('three');

var PhysicsManager = function() {
  this.world = new CANNON.World();
  this.world.gravity.set(0, 0, -9.82); // m/s²

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

/**
 * Add Cannon physics to a three.js object
 * @param {Object} obj - Three.js Object
 * @param {string} author - bounding geometry for physics calculations.
 */
PhysicsManager.prototype.add3DObject = function(obj,type) {
  var mass = 5;
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
      this.threeCannon.push({"t":obj,"c":boxBody});
      break;
    case "sphere":

      var bbox = new THREE.Box3().setFromObject(obj);
      console.log(bbox);
      var radius = bbox.max.x - bbox.min.x; //We assume that the shape is uniform

      var boxShape = new CANNON.Sphere(radius/2);
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
