// 水平方向のスライダーを管理するクラス

export class HorizontalSlider {
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
    /**
     * this.properties には、params.element と params.onResizeEnd を最初から代入するのもいいが、このように書くことで、default値としてnull、関数を代入している。可読性の観点から、こちらの方がいいと思う。
     */
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
  /**
   * 初期化時とリサイズ時に呼び出され、各アイテムの位置を更新する。
   */
  resize() {
    const element = this.properties.element;
    if (element) {
      this.updatePosition(element);
      this.updateTranslate(element);
      this.items.forEach((item, index) => {
        const previousItemElement =
          index > 0 ? this.items[index - 1].properties.element : null;
        const prevItemWidth =
          index > 0 && previousItemElement
            ? previousItemElement.offsetWidth
            : 0;
        item.resize(prevItemWidth);
      });
      // リサイズ終了後のコールバック関数（が登録されていればその関数）を呼び出す
      this.properties.onResizeEnd && this.properties.onResizeEnd();
      this.distance = this.calculateDistance();
    }
  }
  // スライダーと各アイテムを初期化するメソッド
  /**
   * このメソッドは、スライダーの初期化を行う。
   */
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
        sliderItem.initialize();
        this.items[index] = sliderItem;
      });
    window.addEventListener("resize", () => {
      this.resize();
    });
    this.resize();
  }
  // スライダーの位置を更新するメソッド
  updateTranslate(element) {
    // console.log(
    //   `this.basePosX: ${this.basePosX}`,
    //   `this.currentPosX: ${this.currentPosX}`
    // );
    element.style.transform = `translate(${
      this.basePosX - this.currentPosX
    }px, ${this.posY}px)`;
  }
  // スライダーが移動する全体の距離を計算するメソッド
  calculateDistance() {
    let totalDistance = 0;
    this.items.forEach((item, index) => {
      if (item && item.properties.element) {
        // もしアイテムが最初または最後のアイテムなら、その半分の幅を加算
        if (index === 0 || index === this.items.length - 1) {
          totalDistance += item.properties.element.offsetWidth / 2;
        }
        // それ以外のアイテムなら、全幅を加算
        else {
          totalDistance += item.properties.element.offsetWidth;
        }
      }
      // アイテムまたはそのエレメントが存在しない場合は何も加算しない（つまり0を加算）
      else {
        totalDistance += 0;
      }
    });
    totalDistance += (this.items.length - 1) * this.itemMargin;
    // console.log(`totalDistance: ${totalDistance}`);
    return totalDistance;
  }
  // スライダーと親エレメントの位置を更新するメソッド
  updatePosition(element) {
    const maxHeight = this.getMaxHeight();
    const firstItemWidth = this.getWidthOfFirstItem();
    const parentElement = element.parentElement;
    const parentWidth = parentElement
      ? parentElement.getBoundingClientRect().width
      : 0;
    const parentHeight = parentElement
      ? parentElement.getBoundingClientRect().height
      : 0;
    // console.log(
    //   `maxHeight: ${maxHeight}`,
    //   `firstItemWidth: ${firstItemWidth}`,
    //   `parentElement: ${parentElement}`,
    //   `parentWidth: ${parentWidth}`,
    //   `parentHeight: ${parentHeight}`,
    //   `firstItemWidth: ${firstItemWidth}`,
    //   `maxHeight: ${maxHeight}`
    // );
    this.basePosX = parentWidth / 2 - firstItemWidth / 2;
    this.posY = parentHeight / 2 - maxHeight / 2;
  }
  // 最初のアイテムの幅を取得するメソッド
  getWidthOfFirstItem() {
    const firstItem = this.items[0];
    if (firstItem) {
      const itemElement = firstItem.properties.element;
      if (itemElement) {
        return itemElement.getBoundingClientRect().width;
      }
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
