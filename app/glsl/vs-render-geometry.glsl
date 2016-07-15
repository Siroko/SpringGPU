precision highp float;
precision highp sampler2D;

attribute vec2 aV2I;
attribute vec2 aV2ISIM;
uniform highp sampler2D uGeomT;
uniform highp sampler2D uPosT;

varying vec4 vPos;

// rotateAngleAxisMatrix returns the mat3 rotation matrix
// for given angle and axis.
mat3 rotateAngleAxisMatrix(float angle, vec3 axis) {
  float c = cos(angle);
  float s = sin(angle);
  float t = 1.0 - c;
  axis = normalize(axis);
  float x = axis.x, y = axis.y, z = axis.z;
  return mat3(
    t*x*x + c,    t*x*y + s*z,  t*x*z - s*y,
    t*x*y - s*z,  t*y*y + c,    t*y*z + s*x,
    t*x*z + s*y,  t*y*z - s*x,  t*z*z + c
  );
}

void main()	{

    vec2 ind = aV2I;
    vec4 pos = vec4(texture2D( uGeomT, ind ).rgb, 1.0) ;

    vec2 indSim = aV2ISIM;
    vec4 simulationPosition = texture2D(uPosT, indSim);

    pos += simulationPosition;
    vPos = pos * 0.1;

    gl_Position = projectionMatrix * modelViewMatrix * pos;
}
