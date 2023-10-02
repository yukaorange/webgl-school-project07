export class Slider {
  constructor(params) {
    this.selector = null;
    this.prevButton = null;
    this.nextButton = null;
    this.thumbList = [];
    this.itemList = [];
    this.onChange = null;
    this.openModal = null;

    for (let param in params) {
      this[param] = params[param];
    }
    this.init();
  }

  change(prev_id, next_id, total) {
    this.thumbList[prev_id].close();
    this.thumbList[next_id].open();
    this.itemList[prev_id].close();
    this.itemList[next_id].open();
    this.checkButton(next_id, total);
  }

  checkButton(id, total) {
    if (id === 0) {
      this.prevButton.close();
      this.nextButton.open();
    } else if (id === total) {
      this.nextButton.close();
      this.prevButton.open();
    } else {
      this.nextButton.open();
      this.prevButton.open();
    }
  }

  init() {
    this.prevButton = new SliderButton({
      selector: document.querySelector(".slider__button--prev"),
      onClick: () => {
        this.onChange(-1, "button");
      },
    });
    this.prevButton.init(); //SliderButton's init.

    this.nextButton = new SliderButton({
      selector: document.querySelector(".slider__button--next"),
      onClick: () => {
        this.onChange(1, "button");
      },
    });
    this.nextButton.init(); //SliderButton's init.

    let thumbList = document.querySelectorAll(".js-slider__thumb");
    for (let i = 0; i < thumbList.length; i++) {
      this.thumbList[i] = new SliderThumb({
        selector: thumbList[i],
        id: i,
        onClick: thumb_id => {
          this.onChange(thumb_id, "thumb");
        },
      });
      this.thumbList[i].init(); //SliderThumb's init.
    }

    let itemList = document.querySelectorAll(".js-slider__item");
    for (let i = 0; i < itemList.length; i++) {
      this.itemList[i] = new SliderItem({
        selector: itemList[i],
        id: i,
        onClick: () => {
          this.openModal(); //SliderItem is clicked when Slider's openModal  method is called.
        },
      });
      this.itemList[i].init(); //SliderItem's init.
    }
  }
}

class SliderItem {
  constructor(params) {
    this.selector = null;
    this.button = null;
    this.id = null;

    for (let param in params) {
      this[param] = params[param];
    }
  }

  init() {
    this.button = this.selector.children[0];
    this.addEvent();
  }

  open() {
    this.selector.classList.add("is-open");
    setTimeout(() => {
      this.selector.classList.add("is-show");
    }, 200);
  }

  close() {
    this.selector.classList.remove("is-show");
    setTimeout(() => {
      this.selector.classList.remove("is-open");
    }, 200);
  }

  addEvent() {
    this.button.addEventListener("click", () => {
      this.onClick();
    });
  }
}

class SliderThumb {
  constructor(params) {
    this.selector = null;
    this.id = null;

    for (let param in params) {
      this[param] = params[param];
    }
  }

  open() {
    this.selector.classList.add("is-active");
  }

  close() {
    this.selector.classList.remove("is-active");
  }

  init() {
    this.addEvent();
  }

  addEvent() {
    this.selector.addEventListener("click", () => {
      this.onClick(this.id);
    });
  }
}

class SliderButton {
  constructor(params) {
    this.selector = null;

    for (let param in params) {
      this[param] = params[param];
    }
  }

  init() {
    this.addEvent();
  }
  open() {
    this.selector.classList.add("is-show");
  }
  close() {
    this.selector.classList.remove("is-show");
  }

  addEvent() {
    this.selector.addEventListener("click", () => {
      this.onClick();
    });
  }
}
