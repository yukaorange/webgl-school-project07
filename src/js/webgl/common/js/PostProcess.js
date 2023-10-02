'use strict'
import {utils} from './utils.js'
// Simple implementation for post-processing effects
export class PostProcess {
  constructor(gl, canvas, vertexShaderId, fragmentShaderId) {
    this.texture = null //texture for framebuffer. It will be used as input for post-process shader. this size is same as canvas size. Post process shader will be applied to this texture.
    this.framebuffer = null
    this.renderbuffer = null
    this.vertexBuffer = null
    this.indexBuffer = null
    this.textureBuffer = null
    this.program = null
    this.uniforms = null
    this.attributes = null
    this.gl = gl

    this.startTime = Date.now()
    this.canvas = canvas

    this.configureFramebuffer()
    this.configureGeometry()
    this.configureShader(vertexShaderId, fragmentShaderId)
  }

  configureFramebuffer() {
    const { width, height } = this.canvas

    const gl = this.gl

    // Init Color Texture
    this.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // Init Renderbuffer
    this.renderbuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    // Init Framebuffer
    this.framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer)

    // Clean up
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  configureGeometry() {
    // Define the geometry for the full-screen quad
    const vertices = [-1, -1, 1, -1, -1, 1, 1, 1]

    const textureCoords = [0, 0, 1, 0, 0, 1, 1, 1]

    const indices = [0, 1, 2, 2, 1, 3]

    const gl = this.gl


    // Init the buffers
    this.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    this.textureBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

    this.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    // Clean up
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  configureShader(vertexShaderId, fragmentShaderId) {
    // Compile the shader

    const gl = this.gl

    const vertexShader = utils.getShader(gl, vertexShaderId,"vertex")
    const fragmentShader = utils.getShader(gl, fragmentShaderId,"fragment")

    // Cleans up previously created shader objects if we call configureShader again
    if (this.program) {
      gl.deleteProgram(this.program)
    }

    this.program = gl.createProgram()
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Could not initialize post-process shader')
    }

    // Store all the attributes and uniforms for later use
    this.attributes = {}
    const attributesCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES)
    for (let i = 0; i < attributesCount; i++) {
      const attrib = gl.getActiveAttrib(this.program, i)
      this.attributes[attrib.name] = gl.getAttribLocation(this.program, attrib.name)
    }

    this.uniforms = {}
    const uniformsCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < uniformsCount; i++) {
      const uniform = gl.getActiveUniform(this.program, i)
      this.uniforms[uniform.name] = gl.getUniformLocation(this.program, uniform.name)
    }
  }

  validateSize() {
    const gl = this.gl

    const { width, height } = this.canvas

    // 1. Resize Color Texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // 2. Resize Render Buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

    // 3. Clean up
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  }

  bind() {
    const gl = this.gl

    let { width, height } = this.canvas

    // Use the Post Process shader
    gl.useProgram(this.program)

    // Bind the quad geometry
    gl.enableVertexAttribArray(this.attributes.aVertexPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    gl.enableVertexAttribArray(this.attributes.aVertexTextureCoords)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer)
    gl.vertexAttribPointer(this.attributes.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0)

    // Bind the texture from the framebuffer
    gl.activeTexture(gl.TEXTURE0) //serect unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.texture) //bind texture to unit 0
    gl.uniform1i(this.uniforms.uSampler, 0) //send unit 0 to shader

    // If the post process shader uses time as an input, pass it in here
    if (this.uniforms.uTime) {
      gl.uniform1f(this.uniforms.uTime, (Date.now() - this.startTime) / 1000)
    }

    // The inverse texture size can be useful for effects which require precise pixel lookup
    if (this.uniforms.uInverseTextureSize) {
      gl.uniform2f(this.uniforms.uInverseTextureSize, 1 / width, 1 / height)
    }
  }

  // Draw using TRIANGLES primitive
  draw() {
    const gl = this.gl

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }
}
