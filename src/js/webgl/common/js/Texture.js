'use strict'

// Encapsulates creating of WebGL textures
export class Texture {
  constructor(gl, source) {
    this.gl = gl
    this.glTexture = gl.createTexture()
    this.naturalHeight = null
    this.naturalWidth = null
    this.imageAspect = null

    if (source) {
      this.setImage(source)
    }
  }

  // Sets the texture image source
  setImage(source) {
    return new Promise((resolve, reject) => {
      this.image = new Image()
      this.image.onload = () => {
        this.handleLoadedTexture()
        this.naturalHeight = this.image.naturalHeight
        this.naturalWidth = this.image.naturalWidth
        this.imageAspect = this.naturalWidth / this.naturalHeight
        this.imageAspectY = this.naturalHeight / this.naturalWidth
        resolve()
      }
      this.image.onerror = reject
      this.image.src = source
    })
  }

  // Configure texture
  handleLoadedTexture() {
    const { gl, image, glTexture } = this
    // Bind
    gl.bindTexture(gl.TEXTURE_2D, glTexture)
    // Flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    // Configure
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
    gl.generateMipmap(gl.TEXTURE_2D)
    // Clean
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
}
