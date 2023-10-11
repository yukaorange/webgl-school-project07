#version 300 es
precision mediump float;

uniform float uProgress;
uniform float uTime;
uniform float uTexAspectX;
uniform float uTexAspectY;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uDisplacement;

in vec3 vNormal;
in vec3 vLightRay;
in vec3 vEyeVector;
in vec2 vTextureCoords;

out vec4 fragColor;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.f);
  return mix(m, 2.0f - m, step(1.0f, m));
}

void main(void) {
  // Ambient
  vec4 Ia = uLightAmbient * uMaterialAmbient;

      // Diffuse
  vec3 L = normalize(vLightRay);
  vec3 N = normalize(vNormal);
  float lambertTerm = max(dot(N, -L), 1.0f);
  vec4 Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;

      // Specular
  vec3 E = normalize(vEyeVector);
  vec3 R = reflect(L, N);
  float specular = pow(max(dot(R, E), 0.5f), 50.0f);
  vec4 Is = vec4(0.5f) * specular;

  vec4 finalColor = Ia + Id + Is;

  if(uMaterialDiffuse.a != 1.0f) {
    finalColor.a = uMaterialDiffuse.a;
  } else {
    finalColor.a = 1.0f;
  }

  vec2 uv = vTextureCoords;
  uv = uv - vec2(0.5f);
  uv.x *= min(uTexAspectX, 1.f);
  uv.y *= min(uTexAspectY, 1.f);
  uv = uv + vec2(0.5f);

  vec4 texColor0;
  vec4 texColor1;
  float p = uProgress;
  vec2 x = uv;
  vec4 noise = texture(uDisplacement, mirrored(uv + uTime * 0.04f));

  p = p + noise.g * 0.06f;

  p = smoothstep(0.0f, 1.0f, (p * 2.0f + (1.0f - uv.y) - 1.0f));

  float intpl = pow(abs(p), 5.f);

  vec2 uv1 = (x - 0.5f) * (1.0f - intpl) + 0.5f;//zoom in effect.
  vec2 uv2 = (x - 0.5f) * intpl + 0.5f;//zoom out effect.

  texColor0 = texture(uSampler0, uv1);
  texColor1 = texture(uSampler1, uv2);

  vec4 texColor = mix(texColor0, texColor1, p);

  fragColor = finalColor * texColor;
}