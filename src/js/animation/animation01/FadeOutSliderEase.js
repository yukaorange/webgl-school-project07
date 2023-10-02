export class FadeOutSliderEase {
  constructor(options) {
    this.properties = {
      element: null,
      onResizeEnd: () => {},
    };
    this.sliderItems = [];
    this.itemMargin = 20;
    this.totalDistance = 0;
    this.basePositionX = 0;
    this.positionY = 0;
    this.currentPositionX = 0;
    this.scrollProgress = 0;
    this.targetProgress = 0;
    Object.assign(this.properties, options);
  }

  scroll(targetProgress) {
    this.targetProgress = targetProgress;
  }

  resize() {
    const sliderElement = this.properties.element;
    if (sliderElement) {
      this.updatePosition(sliderElement);
      this.updateTranslate(sliderElement);
      this.sliderItems.forEach((sliderItem, index) => {
        const previousItemElement =
            index > 0 ? this.sliderItems[index - 1].properties.element : null,
          prevElementWidth =
            index > 0 && previousItemElement
              ? previousItemElement.offsetWidth
              : 0;
        sliderItem.resize(prevElementWidth);
      });
      this.properties.onResizeEnd && this.properties.onResizeEnd();
      this.totalDistance = this.calculateDistance();
    }
  }

  initialize() {
    const sliderElement = this.properties.element;
    if (!sliderElement) {
      return;
    }
    const sliderItemsNodeList = sliderElement.querySelectorAll(
      "[data-scroll-slider-item]"
    );
    sliderItemsNodeList.forEach((sliderItemElement, index) => {
      const sliderItem = new SliderItem({
        id: index,
        element: sliderItemElement,
        margin: this.itemMargin,
        ratio: 1 / (sliderItemsNodeList.length - 1),
      });
      // console.log(sliderItem.properties)
      sliderItem.initialize();
      this.sliderItems[index] = sliderItem;
    });
    window.addEventListener("resize", () => {
      this.resize();
    });
    this.resize();
    this.update();
  }

  easeIn(t) {
    return t * t;
  }
  easeOut(t) {
    return t * 0.05;
  }
  easeInOut(t) {
    // return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return -0.5 * (Math.cos(Math.PI * t) - 1);
  }
  easeOutElastic(t) {
    const p = 0.3;
    return (
      Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
    );
  }

  update() {
    let diff = this.targetProgress - this.scrollProgress;
    let sign = diff > 0 ? 1 : -1;
    diff = Math.abs(diff);
    diff = Math.max(0, Math.min(1, diff));

    this.scrollProgress += this.easeInOut(diff * 0.5) * sign;

    const sliderElement = this.properties.element;
    sliderElement &&
      (this.currentPositionX = this.totalDistance * this.scrollProgress);
    this.updateTranslate(sliderElement);

    this.sliderItems.forEach(sliderItem => {
      sliderItem.render(this.scrollProgress);
    });
    requestAnimationFrame(() => {
      this.update();
    });
  }

  updateTranslate(sliderElement) {
    sliderElement.style.transform = `translate(${
      this.basePositionX - this.currentPositionX
    }px, ${this.positionY}px)`;
  }

  calculateDistance() {
    let distance = 0;
    this.sliderItems.forEach((sliderItem, index) => {
      if (sliderItem && sliderItem.properties.element) {
        if (index === 0 || index === this.sliderItems.length - 1) {
          distance += sliderItem.properties.element.offsetWidth / 2;
        } else {
          distance += sliderItem.properties.element.offsetWidth;
        }
      }
    });
    distance += (this.sliderItems.length - 1) * this.itemMargin;
    return distance;
  }

  updatePosition(sliderElement) {
    const maxHeight = this.getMaxHeight();
    const firstItemWidth = this.getWidthFirstItem();
    const parentElement = sliderElement.parentElement;
    const parentElementWidth = parentElement
      ? parentElement.getBoundingClientRect().width
      : 0;
    const parentElementHeight = parentElement
      ? parentElement.getBoundingClientRect().height
      : 0;
    this.basePositionX = parentElementWidth / 2 - firstItemWidth / 2;
    this.positionY = parentElementHeight / 2 - maxHeight / 2;
  }

  getWidthFirstItem() {
    const firstSliderItem = this.sliderItems[0];
    if (firstSliderItem) {
      const firstSliderItemElement = firstSliderItem.properties.element;
      if (firstSliderItemElement)
        return firstSliderItemElement.getBoundingClientRect().width;
    }
    return 0;
  }

  getMaxHeight() {
    let maxHeight = 0;
    this.sliderItems.forEach(sliderItem => {
      const sliderItemElement = sliderItem.properties.element;
      if (sliderItemElement) {
        const sliderItemRect = sliderItemElement.getBoundingClientRect();
        maxHeight = Math.max(maxHeight, sliderItemRect.height);
      }
    });
    return maxHeight;
  }
}

// スライダーの各アイテムを管理するクラス
class SliderItem {
  constructor(options) {
    this.properties = {
      id: 0,
      element: null,
      margin: 0,
      ratio: 0,
    };
    this.currentPosX = 0;
    this.progress = 0;
    this.scale = 1;
    this.reductionRatio = 1.0;
    Object.assign(this.properties, options);
  }

  render(progress) {
    this.progress = progress;
    this.scroll(progress);
    this.updateTranslate(progress);
  }

  scroll(progress) {
    this.progress = progress;
    const element = this.properties.element;
    if (!element) return;
    const boundingRect = element.getBoundingClientRect();
    const x = boundingRect.x;
    const width = boundingRect.width;
    const center = x + width / 2;
    this.currentPosX =
      window.innerWidth / 2 > center ? window.innerWidth / 2 - center : 0;
    this.updateTranslate(progress);
  }

  resize(width) {
    const element = this.properties.element;
    if (element) {
      element.style.left = `${
        (width + this.properties.margin) * this.properties.id
      }px`;
    }
  }

  initialize() {
    const element = this.properties.element;
    if (element) {
      this.imgContainerElement = element.querySelector(
        "[data-scroll-slider-img-container]"
      );
    }
  }

  getScale(progress) {
    /**
     * スライドが左に動くほど、progressの値が大きくなるのを利用して、scaleの値を小さくしていくロジック
     */
    const ratioProgress = progress - this.properties.id * this.properties.ratio; //こうすることで、各スライダーのidに応じて、progressの影響度を順次減らしていくことができる。（全体の進捗をスライドの枚数分に分割できる）
    this.progress = ratioProgress * (1 / this.properties.ratio); //ここで比率の逆数をかけることで、progressの値をスケールアップさせることができる。また、この次の記述でthis.progressの値を0~1の間に収める。
    if (this.progress < 0) this.progress = 0;
    if (this.progress > 1) this.progress = 1;
    return 1 - this.progress * this.reductionRatio;
  }

  updateTranslate(progress) {
    if (this.imgContainerElement) {
      this.scale = this.getScale(progress);
      this.imgContainerElement.style.transform = `translate(${this.currentPosX}px, 0px) scale(${this.scale})`;
    }
  }
}
