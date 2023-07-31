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

    this.progress += diff * 0.098;

    this.updateTransform();

    requestAnimationFrame(() => {
      this.update();
    });
  }

  updateTransform() {
    let scale = 1.0;
    let rotate = 0;
    let visibility = "visible";

    let rotatePoint = 0.3;

    if (this.progress <= 0) {
      // rotate = this.progress * 0;
      rotate = 0;
    } else if (this.progress > 0 && this.progress < rotatePoint) {
      rotate = 0;
    } else {
      rotate = (this.progress - rotatePoint) * 5;
    }

    if (this.progress < 0.5) {
      scale = 1;
    } else {
      scale = 1.0 + ((0.5 - this.progress) * 1) / 5;
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
