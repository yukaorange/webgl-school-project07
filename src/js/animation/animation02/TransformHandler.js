export class TransformHandler {
  constructor({ target }) {
    this.target = target;
    this.progress = 0;
    this.targetProgress = 0;
  }

  updateProgress(targetProgress) {
    this.targetProgress = targetProgress;
  }

  update() {
    const diff = this.targetProgress - this.progress;

    this.progress += diff * 0.01;

    this.updateTransform();

    requestAnimationFrame(() => {
      this.update();
    });
  }

  updateTransform() {
    let scale = 1.0;
    let rotate = 0;
    let visibility = "visible";

    if (this.progress <= 0) {
      rotate = this.progress * -3;
    } else if (this.progress > 0 && this.progress < 0.5) {
      rotate = 0;
    } else {
      rotate = (this.progress - 0.5) * 5;
    }

    if (this.progress < 0.5) {
      scale = 1;
    }
    //  else if (this.progress > 0.5 && this.progress < 0.8) {
    //   scale = 1.0 + ((0.5 - this.progress) * 1) / 3;
    // }
    else {
      scale = 1.0 + ((0.5 - this.progress) * 1) / 3;
    }

    if (this.targetProgress > 1.5) {
      visibility = "hidden";
    }

    this.target.style.transform = `rotate(${rotate}deg) scale(${scale})`;
    this.target.style.visibility = visibility;
  }

  getProgress() {
    return this.progress;
  }
}
