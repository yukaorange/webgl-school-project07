export class Gallery {
  constructor(params) {
    this.selector = null;
    this.prevButton = null;
    this.nextButton = null;
    this.itemList = [];
    this.onChange = null;
    for (let param in params) {
      this[param] = params[param];
    }
    this.init();
  }

  change(prev_id, next_id, total) {
    this.itemList[prev_id].close();
    this.itemList[next_id].open();
    this.checkButton(next_id, total);
  }

  checkButton(id, total) {
    if (id == 0) {
      this.prevButton.close();
      this.nextButton.open();
    } else if (id == total) {
      this.nextButton.close();
      this.prevButton.open();
    } else {
      this.nextButton.open();
      this.prevButton.open();
    }
  }

  init() {
    this.prevButton = new GalleryButton({
      selector: document.querySelector(".gallery__button--prev"),
      onClick: () => {
        this.onChange(-1, "button");
      },
    });
    this.prevButton.init();

    this.nextButton = new GalleryButton({
      selector: document.querySelector(".gallery__button--next"),
      onClick: () => {
        this.onChange(1, "button");
      },
    });
    this.nextButton.init();

    let itemList = document.querySelectorAll(".js-gallery__item");
    for (let i = 0; i < itemList.length; i++) {
      this.itemList[i] = new GallaryItem({
        selector: itemList[i],
      });
    }
  }
}

class GallaryItem {
  constructor(params) {
    this.selector = null;

    for (let param in params) {
      this[param] = params[param];
    }
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
}

class GalleryButton {
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
