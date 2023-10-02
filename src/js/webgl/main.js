'use strict'
import * as DAT from 'dat.gui'
import { mat4 } from 'gl-matrix'
import { Camera } from './common/js/Camera.js'
import { Clock } from './common/js/Clock.js'
import { Controls } from './common/js/Controls.js'
import { Program } from './common/js/Program.js'
import { Scene } from './common/js/Scene.js'
import { Transforms } from './common/js/Transforms.js'
import { utils } from './common/js/utils.js'
// import { Axis } from './common/js/Axis'
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'

let gl, scene, camera, clock, program, transforms

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

  const attributes = ['aVertexPosition', 'aVertexNormal', 'aVertexColor', 'aVertexTextureCoords']

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
    'uSampler',
  ]

  program.load(attributes, uniforms)

  clock = new Clock()
  scene = new Scene(gl, program)

  camera = new Camera(Camera.ORBITING_TYPE)
  camera.goHome([0, 0, 250])
  camera.setFocus([0, 0, 0])
  camera.setElevation(0)
  camera.setAzimuth(0)


  new Controls(camera, canvas)

  transforms = new Transforms(gl, program, camera, canvas)

  gl.uniform3fv(program.uLightPosition, [20, 20, 20])
  gl.uniform4fv(program.uLightAmbient, [1, 1, 1, 1])
  gl.uniform4fv(program.uLightDiffuse, [1, 1, 1, 1])
  gl.uniform1f(program.uAlpha, 1)
}

function load() {
  scene.load('/geometries/plane.json', 'plane', {
    position: [0, 0, 0],
    scale: [1, 1, 1],
    rotate: [Math.PI / 2, 0, 0],
  })
}

function render() {
  // const elapsedTime = clock.getElapsedTime()
  // console.log(elapsedTime)
  draw()
}

function draw() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  transforms.updatePerspective()

  try {
    program.useProgram()

    scene.traverse((object) => {
      transforms.calculateModelView()
      transforms.push()

      if (object.alias !== 'floor') {
        mat4.rotateX(transforms.modelViewMatrix, transforms.modelViewMatrix, object.rotate[0])
        mat4.translate(transforms.modelViewMatrix, transforms.modelViewMatrix, object.position)
        mat4.scale(transforms.modelViewMatrix, transforms.modelViewMatrix, object.scale)
      }

      transforms.setMatrixUniforms()
      transforms.pop()

      gl.uniform4fv(program.uMaterialDiffuse, object.diffuse)
      gl.uniform4fv(program.uMaterialAmbient, object.ambient)
      gl.uniform1i(program.uUseVertexColor, false)

      // Bind
      gl.bindVertexArray(object.vao)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo)

      // Activate texture
      if (object.textureCoords) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, object.texture.glTexture)
        gl.uniform1i(program.uSampler, 0)
      }

      // Draw
      gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0)

      // Clean
      gl.bindVertexArray(null)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    })
  } catch (error) {
    console.error(error)
  }
}

function addControls() {
  const gui = new DAT.GUI()
  const lightSettings = {
    x: 0,
    y: 0,
    z: 0,
  }
  // gui.add(lightSettings, 'x', -20, 20).onChange(updateLightPosition)
  // gui.add(lightSettings, 'y', -20, 20).onChange(updateLightPosition)
  // gui.add(lightSettings, 'z', -20, 20).onChange(updateLightPosition)
  function updateLightPosition() {
    gl.uniform3fv(program.uLightPosition, [lightSettings.x, lightSettings.y, lightSettings.z])
  }
}

export function init() {
  configure()
  addControls()
  load()
  clock.on('tick', render)
}
