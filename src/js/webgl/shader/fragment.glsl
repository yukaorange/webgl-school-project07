#version 300 es
precision mediump float;

uniform float uProgress;
uniform float uTexAspectX;
uniform float uTexAspectY;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

in vec3 vNormal;
in vec3 vLightRay;
in vec3 vEyeVector;
in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  // Ambient
  vec4 Ia = uLightAmbient * uMaterialAmbient;

      // Diffuse
  vec3 L = normalize(vLightRay);
  vec3 N = normalize(vNormal);
  float lambertTerm = max(dot(N, -L), 0.33f);
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

  vec4 texColor;
  float blendFactor;
  
  if(uProgress < 0.33f) {
    blendFactor = uProgress / 0.33f;
    vec4 texColor0 = texture(uSampler0, uv);
    vec4 texColor1 = texture(uSampler1, uv);
    texColor = mix(texColor0, texColor1, blendFactor);
  } else if(uProgress < 0.66f) {
    blendFactor = (uProgress - 0.33f) / 0.33f;
    vec4 texColor1 = texture(uSampler1, uv);
    vec4 texColor2 = texture(uSampler2, uv);
    texColor = mix(texColor1, texColor2, blendFactor);
  } else {
    blendFactor = (uProgress - 0.66f) / 0.34f; //last segment needs +0.01f to avoid rounding errors
    vec4 texColor2 = texture(uSampler2, uv);
    vec4 texColor3 = texture(uSampler3, uv);
    texColor = mix(texColor2, texColor3, blendFactor);
  }


  fragColor = finalColor * texColor;
}