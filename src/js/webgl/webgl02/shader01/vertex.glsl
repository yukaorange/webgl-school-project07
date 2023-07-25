uniform float time;
uniform float uXAspect;
uniform float uYAspect;
uniform float uProgress;

uniform vec2 uResolution;
uniform vec2 uQuadSize;
uniform vec4 uCorners;

varying vec2 vSize;
varying vec2 vUv;

float PI = 3.1415926535897932384626433832795;

//modelMatrixとは、モデルの位置、回転、スケールを表す行列
//viewMatrixとは、カメラの位置、回転、スケールを表す行列
//projectionMatrixとは、カメラのレンズの種類や焦点距離、画面のサイズなどを表す行列

void main() {
  vUv = uv;

  // float sine = sin(PI * uProgress);//uProgressは0~1の値を取る。sin(0)=0から始まり、sin(PI)=0に終わる。

  // float waves = sine * 0.1 * sin(5. * length(uv) + 15. * uProgress);

  vec4 defaultState = modelMatrix * vec4(position, 1.0);
  vec4 fullScreenState = vec4(position, 1.0);
  fullScreenState.x *= uResolution.x;
  fullScreenState.y *= uResolution.y;
  // fullScreenState.z += 40. * uCorners.x;

  // float cornersProgress = mix(uCorners.x, uCorners.y, uv.x);
  //uv.xは0~1の値を取るため、uCorners.xはuv.xが0の地点に影響する。uCorners.はuv.xが1の地点に影響する。uCorners.xが0～1に変化している間、uCorners.yはまだ0のまま。uv.xが1の点ではuCorners.yになる。

  float cornersProgress = mix(//uv.yが0の地点ではmix(uCorners.y, uCorners.w, uv.x)が影響する。uv.yが1の地点ではmix(uCorners.x, uCorners.z, uv.x)が影響する。uv.xが0の地点ではuCorners.yが影響する。uv.xが1かつuv.yが1の地点では uCorners.zが影響する。各頂点に影響力のあるuCornersを書くと分かりやすい。
  mix(uCorners.y, uCorners.w, uv.x), //
  mix(uCorners.x, uCorners.z, uv.x), //
  uv.y//
  );
  float sine = sin(PI * cornersProgress);//uProgressは0~1の値を取る。sin(0)=0から始まり、sin(PI)=0に終わる。
  float waves = sine * 0.1 * sin(15. * length(uv) + 10. * cornersProgress);

  vec4 finalState = mix(defaultState, fullScreenState, cornersProgress + waves);
  // vec4 finalState = mix(defaultState, fullScreenState, uProgress + waves);

  vSize = mix(uQuadSize, uResolution, cornersProgress);//quadSizeはplaneのサイズ、uResolutionは画面のサイズ
  // vSize = mix(uQuadSize, uResolution, uProgress);//quadSizeはplaneのサイズ、uResolutionは画面のサイズ

  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * finalState;
}