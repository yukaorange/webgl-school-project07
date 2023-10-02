'use strict';

// Simple implementation of mouse picking on a HTML5 canvas
class Picker {

  constructor(canvas, callbacks) {
    this.pickedList = [];

    this.canvas = canvas;
    this.texture = null;
    this.framebuffer = null;
    this.renderbuffer = null;
    this.hitPropertyCallback = null;
    this.addHitCallback = null;
    this.moveCallback = null;
    this.processHitsCallback = null;
    this.removeHitCallback = null;

    // Attach all callback onto instance
    Object.assign(this, callbacks);

    this.configure();
  }

  configure() {
    const { width, height } = this.canvas;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  getHits() {
    return this.pickedList;
  }

  update() {
    const { width, height } = this.canvas;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }

  // Compare whether the pixel matches the readout
  compare(readout, color) {
    return (
      Math.abs(Math.round(color[0] * 255) - readout[0]) <= 1 &&
      Math.abs(Math.round(color[1] * 255) - readout[1]) <= 1 &&
      Math.abs(Math.round(color[2] * 255) - readout[2]) <= 1
    );
  }

  find(coords) {
    const readout = new Uint8Array(1 * 1 * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.readPixels(coords.x, coords.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);//readout is picked pixel color
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    let found = false;

    scene.traverse(obj => {
      if (obj.alias === 'floor') return;

      const property = this.hitPropertyCallback && this.hitPropertyCallback(obj);//return obj.pickingColor

      if (!property) return false;

      if (this.compare(readout, property)) {// picked color is same as obj.pickingColor
        const idx = this.pickedList.indexOf(obj);//pickedListがobjを含まない場合、-1を返す

        if (~idx) {// idxが-1のとき、~idxは0になり、このブロックは実行されない
          // idxが-1でないとき、(例えば、idx1が返されたとき)、~idxは-2（truthy）になり、このブロックが実行される
          // Remove from the list
          this.pickedList.splice(idx, 1);
          if (this.removeHitCallback) {
            this.removeHitCallback(obj);
          }
        }
        else {// idxが-1のとき、このブロックが実行される
          // Add to the list
          this.pickedList.push(obj);
          if (this.addHitCallback) {
            this.addHitCallback(obj);
          }
        }
        return found = true;
      }
    });
    return found;
  }

  stop() {
    if (this.processHitsCallback && this.pickedList.length) {
      this.processHitsCallback(this.pickedList);
    }
    this.pickedList = [];
  }

}

