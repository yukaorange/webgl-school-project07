#version 300 es
precision mediump float;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform bool uOffscreen;
uniform sampler2D uSampler;

in vec3 vNormal;
in vec3 vLightRay;
in vec3 vEyeVector;
in vec4 vFinalColor;
in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  if(uOffscreen) {
    fragColor = uMaterialDiffuse;
    return;
  }

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

  fragColor = finalColor * texture(uSampler, vec2(vTextureCoords.s, vTextureCoords.t));
}