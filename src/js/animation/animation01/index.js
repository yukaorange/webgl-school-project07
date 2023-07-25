import { gsap } from "gsap";

// スライダーの各アイテムを管理するクラス
class SliderItem {
  constructor(params) {
    // プロパティを初期化
    this.properties = {
      id: 0, // 各スライダーアイテムのID
      element: null, // 対象のHTMLエレメント
      margin: 0, // アイテム間のマージン
    };
    // 引数のパラメータで上書き
    Object.assign(this.properties, params);
  }
  // 幅に応じて位置を調整するメソッド
  resize(width) {
    const element = this.properties.element;
    if (element) {
      element.style.left = `${
        (width + this.properties.margin) * this.properties.id
      }px`;
    }
  }
  initialize() {
    this.properties.element;
  }
}

// 水平方向のスライダーを管理するクラス
class HorizontalSlider {
  constructor(params) {
    this.properties = {
      element: null, // スライダーのHTMLエレメント
      onResizeEnd: () => {}, // リサイズ終了後のコールバック関数
    };
    this.items = []; // スライダー内の各アイテム
    this.itemMargin = 20; // アイテム間のマージン
    this.distance = 0; // スライド距離
    this.basePosX = 0; // ベースとなるX座標
    this.posY = 0; // Y座標
    this.currentPosX = 0; // 現在のX座標
    // 引数のパラメータで上書き
    Object.assign(this.properties, params);
  }
  // スクロール位置に合わせてスライダーを移動するメソッド
  scroll(scrollRatio) {
    const element = this.properties.element;
    if (element) {
      this.currentPosX = this.distance * scrollRatio;
      this.updateTranslate(element);
    }
  }
  // スライダーと各アイテムの位置を更新するメソッド
  resize() {
    const element = this.properties.element;
    if (element) {
      this.updatePosition(element);
      this.updateTranslate(element);
      this.items.forEach((item, index) => {
        const previousItemElement =
            index > 0 ? this.items[index - 1].properties.element : null,
          prevItemWidth =
            index > 0 && previousItemElement
              ? previousItemElement.offsetWidth
              : 0;
        item.resize(prevItemWidth);
      });
      this.properties.onResizeEnd && this.properties.onResizeEnd();
      this.distance = this.calculateDistance();
    }
  }
  // スライダーと各アイテムを初期化するメソッド
  initialize() {
    const element = this.properties.element;
    if (!element) return;
    element
      .querySelectorAll("[data-scroll-slider-item]")
      .forEach((itemElement, index) => {
        const sliderItem = new SliderItem({
          id: index,
          element: itemElement,
          margin: this.itemMargin,
        });
        sliderItem.initialize(), (this.items[index] = sliderItem);
      });
    window.addEventListener("resize", () => {
      this.resize();
    });
    this.resize();
  }
  // スライダーの位置を更新するメソッド
  updateTranslate(element) {
    element.style.transform = `translate(${
      this.basePosX - this.currentPosX
    }px, ${this.posY}px)`;
  }
  // スライダーが移動する全体の距離を計算するメソッド
  calculateDistance() {
    let totalDistance = 0;
    this.items.forEach((item, index) => {
      totalDistance +=
        index === 0 || index === this.items.length - 1
          ? item && item.properties.element
            ? item.properties.element.offsetWidth / 2
            : 0
          : item && item.properties.element
          ? item.properties.element.offsetWidth
          : 0;
    });
    totalDistance += (this.items.length - 1) * this.itemMargin;
    return totalDistance;
  }
  // スライダーと親エレメントの位置を更新するメソッド
  updatePosition(element) {
    const maxHeight = this.getMaxHeight(),
      firstItemWidth = this.getWidthOfFirstItem(),
      parentElement = element.parentElement,
      parentWidth = parentElement
        ? parentElement.getBoundingClientRect().width
        : 0,
      parentHeight = parentElement
        ? parentElement.getBoundingClientRect().height
        : 0;
    this.basePosX = (parentWidth - firstItemWidth) / 2;
    this.posY = (parentHeight - maxHeight) / 2;
  }
  // 最初のアイテムの幅を取得するメソッド
  getWidthOfFirstItem() {
    const firstItem = this.items[0];
    if (firstItem) {
      const itemElement = firstItem.properties.element;
      if (itemElement) return itemElement.getBoundingClientRect().width;
    }
    return 0;
  }
  // スライダー内のアイテムの最大高さを取得するメソッド
  getMaxHeight() {
    let maxHeight = 0;
    this.items.forEach((item) => {
      const itemElement = item.properties.element;
      if (itemElement) {
        const rectangle = itemElement.getBoundingClientRect();
        maxHeight = Math.max(maxHeight, rectangle.height);
      }
    });
    return maxHeight;
  }
}

let horizontalSlider, scrollElements;

// スクロール時のハンドラ関数
const scrollHandler = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollElements && scrollElements.length > 0) {
    scrollElements.forEach((element, index) => {
      const rectTop = element.getBoundingClientRect().top,
        height = element.offsetHeight,
        scrollPos = scrollTop + rectTop,
        scrollDiff = scrollTop - scrollPos,
        heightDiff = height - window.innerHeight,
        scrollRatio = Math.max(0, Math.min(1, scrollDiff / heightDiff));
      if (index === 0 && horizontalSlider) {
        horizontalSlider.scroll(scrollRatio);
      }
    });
  }
};

export const init = () => {
  scrollElements = document.querySelectorAll("[data-content-sticky]");
  const sliderElement = document.querySelector('[data-scroll-slider="0"]');

  if (sliderElement) {
    horizontalSlider = new HorizontalSlider({
      element: sliderElement,
      onResizeEnd: () => {
        scrollHandler();
      },
    });
    horizontalSlider.initialize();
  }
  window.addEventListener("scroll", () => {
    scrollHandler();
  });
  scrollHandler();
};


// class ScrollSlider {
// 	constructor(config) {
// 		this.props = {
// 			element: null,
// 			onResizeEnd: () => {}
// 		},
// 		this.items = [],
// 		this.itemMargin = 20,
// 		this.distance = 0,
// 		this.basePosX = 0,
// 		this.posY = 0,
// 		this.currentPosX = 0,
// 		this.progress = 0,
// 		Object.assign(this.props, config)
// 	}
// 	scroll(progressValue) {
// 		this.progress = progressValue;
// 		const sliderElement = this.props.element;
// 		sliderElement && (this.currentPosX = this.distance * progressValue, this.updateTranslate(sliderElement), this.items.forEach(item => {
// 			item.scroll(progressValue)
// 		}))
// 	}
// 	resize() {
// 		const sliderElement = this.props.element;
// 		sliderElement && (this.updatePosition(sliderElement), this.updateTranslate(sliderElement), this.items.forEach((item, index) => {
// 			const previousElement = index > 0 ? this.items[index - 1].props.element : null,
// 				previousWidth = index > 0 && previousElement ? previousElement.offsetWidth : 0;
// 			item.resize(previousWidth)
// 		}), this.props.onResizeEnd && this.props.onResizeEnd(), this.distance = this.getDistance())
// 	}
// 	init() {
// 		const sliderElement = this.props.element;
// 		if (!sliderElement) return;
// 		const sliderItems = sliderElement.querySelectorAll("[data-scroll-slider-item]");
// 		sliderItems.forEach((item, index) => {
// 			const sliderItem = new ScrollItem({
// 				id: index,
// 				element: item,
// 				margin: this.itemMargin,
// 				ratio: 1 / (sliderItems.length - 1)
// 			});
// 			sliderItem.init(),
// 			this.items[index] = sliderItem
// 		}),
// 		window.addEventListener("resize", () => {
// 			this.resize()
// 		}),
// 		this.resize(),
// 		this.render()
// 	}
// 	render() {
// 		this.items.forEach((item, index) => {
// 			item.render(this.progress)
// 		}),
// 		requestAnimationFrame(() => {
// 			this.render()
// 		})
// 	}
// 	updateTranslate(sliderElement) {
// 		sliderElement.style.transform = `translate(${this.basePosX - this.currentPosX}px, ${this.posY}px)`
// 	}
// 	getDistance() {
// 		let distance = 0;
// 		this.items.forEach((item, index) => {
// 			index === 0 || index === this.items.length - 1 ? distance += item && item.props.element ? item.props.element.offsetWidth / 2 : 0 : distance += item && item.props.element ? item.props.element.offsetWidth : 0
// 		}),
// 		distance += (this.items.length - 1) * this.itemMargin;
// 		return distance;
// 	}
// 	updatePosition(sliderElement) {
// 		const maxHeight = this.getMaxHeight(),
// 			widthFirstItem = this.getWidthFirstItem(),
// 			parentElement = sliderElement.parentElement,
// 			parentWidth = parentElement ? parentElement.getBoundingClientRect().width : 0,
// 			parentHeight = parentElement ? parentElement.getBoundingClientRect().height : 0;
// 		this.basePosX = (parentWidth - widthFirstItem) / 2,
// 		this.posY = (parentHeight - maxHeight) / 2
// 	}
// 	getWidthFirstItem() {
// 		const firstItem = this.items[0];
// 		if (firstItem) {
// 			const firstElement = firstItem.props.element;
// 			if (firstElement) return firstElement.getBoundingClientRect().width
// 		}
// 		return 0
// 	}
// 	getMaxHeight() {
// 		let maxHeight = 0;
// 		this.items.forEach(item => {
// 			const itemElement = item.props.element;
// 			if (itemElement) {
// 				const itemRect = itemElement.getBoundingClientRect();
// 				maxHeight = Math.max(maxHeight, itemRect.height)
// 			}
// 		}),
// 		return maxHeight;
// 	}
// }

// let sliderOne, sliderTwo, stickyElements;

// const updateScroll = () => {
// 	const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
// 	stickyElements && stickyElements.length > 0 && stickyElements.forEach((element, index) => {
// 		const rectTop = element.getBoundingClientRect().top,
// 			elementHeight = element.offsetHeight,
// 			relativeTop = scrollPosition + rectTop,
// 			scrollOffset = scrollPosition - relativeTop,
// 			heightDifference = elementHeight - window.innerHeight,
// 			progress = Math.max(0, Math.min(1, scrollOffset / heightDifference));
// 		index === 0 && sliderOne && sliderOne.scroll(progress),
// 		index === 1 && sliderTwo && sliderTwo.scroll(progress)
// 	})
// }

// const init2 = () => {
// 	stickyElements = document.querySelectorAll("[data-content-sticky]");
// 	const sliderElementOne = document.querySelector('[data-scroll-slider="0"]');
// 	sliderElementOne && (sliderOne = new ScrollSlider({
// 		element: sliderElementOne,
// 		onResizeEnd: () => {
// 			updateScroll()
// 		}
// 	}), sliderOne.init());
// 	const sliderElementTwo = document.querySelector('[data-scroll-slider="1"]');
// 	sliderElementTwo && (sliderTwo = new ScrollSlider({
// 		element: sliderElementTwo,
// 		onResizeEnd: () => {
// 			updateScroll()
// 		}
// 	}), sliderTwo.init()),
// 	window.addEventListener("scroll", () => {}),
// 	window.addEventListener("scroll", () => {
// 		updateScroll()
// 	}),
// 	updateScroll()
// };
