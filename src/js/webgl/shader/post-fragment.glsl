#version 300 es
precision mediump float;

const float speed = 15.0f;
const float magnitude = 0.015f;

uniform sampler2D uSampler;
uniform float uTime;

in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  vec2 wavyCoord;
  wavyCoord.s = vTextureCoords.s + sin(uTime + vTextureCoords.t * speed) * magnitude;
  wavyCoord.t = vTextureCoords.t + cos(uTime + vTextureCoords.s * speed) * magnitude;
  fragColor = texture(uSampler, wavyCoord);
}
