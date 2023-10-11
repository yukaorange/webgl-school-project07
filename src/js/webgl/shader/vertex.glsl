  #version 300 es
precision mediump float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightPosition;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aVertexTextureCoords;

out vec3 vNormal;
out vec3 vLightRay;
out vec3 vEyeVector;
out vec2 vTextureCoords;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0f);
  vec4 light = vec4(uLightPosition, 1.0f);

  vTextureCoords = aVertexTextureCoords;

  vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0f));
  vLightRay = vertex.xyz - light.xyz;
  vEyeVector = -vec3(vertex.xyz);//this direction is the same as the camera position.because aVertexPosition * uModelViewMatrix = current view transform is view matrix.

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0f);
}