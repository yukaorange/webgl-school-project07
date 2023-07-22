uniform float time;
uniform float uXAspect;
uniform float uYAspect;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vec2 vUv = vUv;
  vUv = vUv - vec2(0.5);
  vUv.x *= min(uXAspect, 1.);
  vUv.y *= min(uYAspect, 1.);
  vUv += 0.5;
  vec4 textureColor = texture2D(uTexture, vUv);
  gl_FragColor = textureColor;
}