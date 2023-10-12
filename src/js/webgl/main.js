'use strict'

// import * as DAT from 'dat.gui'
import { mat4 } from 'gl-matrix'
import { Camera } from './common/js/Camera.js'
import { Clock } from './common/js/Clock.js'
import { Controls } from './common/js/Controls.js'
import { Program } from './common/js/Program.js'
import { Scene } from './common/js/Scene.js'
import { Texture } from './common/js/Texture.js'
import { Transforms } from './common/js/Transforms.js'
import { utils } from './common/js/utils.js'
// import { Axis } from './common/js/Axis'
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'
import { ScrollAmountHandler } from '@/js/utils/ScrollHandler'

let gl,
  scene,
  camera,
  clock,
  program,
  transforms,
  texture0,
  texture1,
  texture2,
  texture3,
  displacement,
  aspect,
  progress = 0,
  targetProgress,
  scrollRatio,
  texAspectX,
  texAspectY,
  texIndex,
  nextTexIndex,
  texArray = []

function configure() {
  const canvas = utils.getCanvas('webgl-canvas')
  utils.autoResizeCanvas(canvas)

  gl = utils.getGLContext(canvas)
  gl.clearColor(1.0, 1.0, 1.0, 1)
  gl.clearDepth(100)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LESS)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  program = new Program(gl, vertexShader, fragmentShader)

  const attributes = ['aVertexPosition', 'aVertexNormal', 'aVertexTextureCoords']

  const uniforms = [
    'uProjectionMatrix',
    'uModelViewMatrix',
    'uNormalMatrix',
    'uMaterialDiffuse',
    'uMaterialAmbient',
    'uLightAmbient',
    'uLightDiffuse',
    'uLightPosition',
    'uAlpha',
    'uUseVertexColor',
    'uOffscreen',
    'uSampler0',
    'uSampler1',
    'uDisplacement',
    'uTexAspectX',
    'uTexAspectY',
    'uAspect',
    'uProgress',
    'uTime',
  ]

  let fov = 45
  let fovRad = fov * (Math.PI / 180)
  let theta = fovRad / 2
  let planeHeight = 100
  let distance = planeHeight / 2 / Math.tan(theta)

  program.load(attributes, uniforms)

  clock = new Clock()
  scene = new Scene(gl, program)

  camera = new Camera(Camera.ORBITING_TYPE, fovRad)
  camera.goHome([0, 0, distance])
  camera.setFocus([0, 0, 0])
  camera.setElevation(0)
  camera.setAzimuth(0)
  new Controls(camera, canvas)

  transforms = new Transforms(gl, program, camera, canvas)

  texture0 = new Texture(gl)
  texture1 = new Texture(gl)
  texture2 = new Texture(gl)
  texture3 = new Texture(gl)
  displacement = new Texture(gl)

  gl.uniform3fv(program.uLightPosition, [10, 20, 10])
  gl.uniform4fv(program.uLightAmbient, [0.1, 0.1, 0.1, 1])
  gl.uniform4fv(program.uLightDiffuse, [0.69, 0.69, 0.69, 0])
  gl.uniform1f(program.uAlpha, 1)
}

async function loadTextures() {
  await texture0.setImage('sky/sky-01.jpg')
  await texture1.setImage('sky/sky-02.jpg')
  await texture2.setImage('sky/sky-03.jpg')
  await texture3.setImage('sky/sky-04.jpg')
  await displacement.setImage('textures/disp1.jpg')
  texArray = [texture0, texture1, texture2, texture3]
}

function load() {
  let aspect = gl.canvas.width / gl.canvas.height
  scene.load('/geometries/plane.json', 'plane', {
    position: [0, 0, 0],
    scale: [aspect, 1, 1],
    rotate: [0, 0, 0],
  })
}

function render() {
  scrollRatio = updateScrollAmount(scrollRatio)
  targetProgress = updateProgress(scrollRatio)
  if (targetProgress === 1) {
    progress = 0.99
  }
  if (targetProgress === 0) {
    progress = 0.01
  }
  progress += (targetProgress - progress) * 0.1 
  draw()
}

function draw() {
  const elapsedTime = clock.getElapsedTime() / 1000
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  transforms.updatePerspective()

  try {
    program.useProgram()

    scene.traverse((object) => {
      transforms.calculateModelView()
      transforms.push()

      // if (object.alias !== 'floor') {
      // }

      if (object.alias === 'plane') {
        // mat4.rotateY(transforms.modelViewMatrix, transforms.modelViewMatrix, (object.rotate[2] = elapsedTime / 1000))
        mat4.translate(transforms.modelViewMatrix, transforms.modelViewMatrix, object.position)
        mat4.scale(transforms.modelViewMatrix, transforms.modelViewMatrix, object.scale)
      }

      transforms.setMatrixUniforms()
      transforms.pop()

      gl.uniform4fv(program.uMaterialDiffuse, object.diffuse)
      gl.uniform4fv(program.uMaterialAmbient, object.ambient)
      gl.uniform1i(program.uUseVertexColor, false)
      gl.uniform1f(program.uProgress, progress)
      gl.uniform1f(program.uAspect, aspect)
      gl.uniform1f(program.uTime, elapsedTime)

      // Bind
      gl.bindVertexArray(object.vao)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo)

      // Activate texture
      if (object.textureCoords) {
        gl.uniform1f(program.uTexAspectX, texAspectX)
        gl.uniform1f(program.uTexAspectY, texAspectY)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texArray[texIndex].glTexture)
        gl.uniform1i(program.uSampler0, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, texArray[nextTexIndex].glTexture)
        gl.uniform1i(program.uSampler1, 1)

        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, displacement.glTexture, 2)
        gl.uniform1i(program.uDisplacement, 2)
      }

      // Draw
      gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0)

      // Clean
      gl.bindVertexArray(null)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
      gl.bindTexture(gl.TEXTURE_2D, null)
    })
  } catch (error) {
    console.error(error)
  }
}

// function addControls() {
//   const gui = new DAT.GUI()
//   const lightSettings = {
//     x: 0,
//     y: 0,
//     z: 0,
//   }
//   gui.add(lightSettings, 'x', -20, 20).onChange(updateLightPosition)
//   gui.add(lightSettings, 'y', -20, 20).onChange(updateLightPosition)
//   gui.add(lightSettings, 'z', -20, 20).onChange(updateLightPosition)
//   function updateLightPosition() {
//     gl.uniform3fv(program.uLightPosition, [lightSettings.x, lightSettings.y, lightSettings.z])
//   }
// }

function resizeHandler() {
  const currentWidth = window.innerWidth

  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth
    const widthDiff = newWidth - currentWidth
    if (widthDiff > 0.1 || widthDiff < -0.1) {
      console.log('resize')
      resize()
      updateAspect()
    }
  })
  resize()
  updateAspect()
}

function resize() {
  scene.traverse((object) => {
    if (object.alias === 'plane') {
      object.scale[0] = window.innerWidth / window.innerHeight
    }
  })
}

function updateAspect() {
  aspect = gl.canvas.width / gl.canvas.height
  let aspectX = gl.canvas.width / gl.canvas.height
  let aspectY = gl.canvas.height / gl.canvas.width
  let culclatedAspectX = aspectX / texture0.imageAspect
  let culclatedAspectY = aspectY / texture0.imageAspectY
  texAspectX = culclatedAspectX
  texAspectY = culclatedAspectY
  // console.log(
  //   `windowAspX:${aspectX}\nwindowAspY:${aspectY}\nimageAspX :${texture0.imageAspect}\nimageAspY :${texture0.imageAspectY}\ntexAspX   :${texAspectX}\ntexAspY   :${texAspectY}`,
  // )
}

function updateScrollAmount(scrollRatio) {
  let scrollAmountHandler, scroller, target
  scroller = document.querySelector('.js-scroller')
  target = document.querySelector('.js-scroller-target')

  scrollAmountHandler = new ScrollAmountHandler({ targetDom: target })
  scrollAmountHandler.update()
  scrollRatio = scrollAmountHandler.getScrollRatio()

  scroller.addEventListener('scroll', () => {
    scrollAmountHandler.update()
    scrollRatio = scrollAmountHandler.getScrollRatio()
  })

  window.addEventListener('resize', () => {
    scrollAmountHandler.update()
    scrollRatio = scrollAmountHandler.getScrollRatio()
  })
  return scrollRatio
}

function updateProgress(scrollRatio) {
  const count = texArray.length - 1
  const perImageProgress = 1 / count
  texIndex = Math.floor(scrollRatio / perImageProgress)
  nextTexIndex = texIndex + 1
  if (nextTexIndex >= count) {
    nextTexIndex = count
  }
  const transitionProgress = (scrollRatio % perImageProgress) / perImageProgress

  if (transitionProgress < 0.25) {
    scrollRatio = 0
  } else if (transitionProgress > 0.75) {
    scrollRatio = 1
  } else {
    const normalizedProgress = (transitionProgress - 0.25) / 0.5
    scrollRatio = normalizedProgress
  }
  // console.log(`progress:${progress}\n`, `texIndex:${texIndex}\n`, `nextTexIndex:${nextTexIndex}`)
  return scrollRatio
}

export async function init() {
  configure()
  await loadTextures()
  // addControls()
  load()
  resizeHandler()
  updateScrollAmount(scrollRatio)
  clock.on('tick', render)
}
