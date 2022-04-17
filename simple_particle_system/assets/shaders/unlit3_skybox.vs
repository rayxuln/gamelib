#version 300 es
layout(location = 0) in vec3 pos;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec3 normal;
layout(location = 3) in vec4 mMatrix0;
layout(location = 4) in vec4 mMatrix1;
layout(location = 5) in vec4 mMatrix2;
layout(location = 6) in vec4 mMatrix3;
layout(location = 7) in vec4 vColor;
layout(location = 8) in vec2 uvOffset;


uniform mat4 vMatrix;
uniform mat4 umMatrix;
uniform mat4 pMatrix;
uniform bool enableBillboard;
uniform bool enableInstanceDraw;
uniform vec2 uvScale;

out highp vec2 fragUV;
out mediump vec4 vertColor;
out mediump vec3 vertPos;

void main() {
  mat4 mMatrix = umMatrix;
  if (enableInstanceDraw) {
    mMatrix[0] = mMatrix0;
    mMatrix[1] = mMatrix1;
    mMatrix[2] = mMatrix2;
    mMatrix[3] = mMatrix3;
  }

  if (enableBillboard) {
    vec3 viewPos = vMatrix[3].xyz;
    vec3 modelPos = mMatrix[3].xyz;
    vec3 lookAtVec = normalize(viewPos - modelPos);
    vec3 rightVec = normalize(cross(vec3(mMatrix[1]), lookAtVec));
    vec3 upVec = normalize(cross(lookAtVec, rightVec));

    mat4 lookAtMatrix;
    lookAtMatrix[0] = vec4(rightVec.xyz, 0.0);
    lookAtMatrix[1] = vec4(upVec.xyz, 0.0);
    lookAtMatrix[2] = vec4(lookAtVec.xyz, 0.0);
    lookAtMatrix[3] = vec4(modelPos.xyz, 1.0);

    mat4 oldMatrix;
    float xLen = length(mMatrix[0]);
    float yLen = length(mMatrix[1]);
    float zLen = length(mMatrix[2]);
    oldMatrix[0] = vec4(xLen, 0.0, 0.0, 0.0);
    oldMatrix[1] = vec4(0.0, yLen, 0.0, 0.0);
    oldMatrix[2] = vec4(0.0, 0.0, zLen, 0.0);
    oldMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);
  
    gl_Position = pMatrix * inverse(vMatrix) * lookAtMatrix * oldMatrix * vec4(pos, 1.0);
  } else {
    gl_Position = pMatrix * inverse(vMatrix) * mMatrix * vec4(pos, 1.0);
  }
  
  fragUV = uv * uvScale;
  if (enableInstanceDraw) {
    fragUV = fragUV + uvOffset;
  }
  vertColor = vColor;

  vertPos = pos;
}