export class Modal {
  constructor(params) {
    this.selector = null;
    for (let param in params) {
      //argument is passed from the constructor of the class that inherits this class.
      this[param] = params[param];
    }
    this.closeButton = null;
    this.init();
  }

  init() {
    this.closeButton = new ModalCloseButton({
      selector: document.querySelector("#modal-close"),
      onClick: () => {
        this.closeModal();
      },
    });
    this.closeButton.init();
  }

  open(id) {
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

class ModalCloseButton {
  constructor(params) {
    this.selector = null;
    for (let param in params) {
      this[param] = params[param];
    }
  }

  init() {
    this.addEvent();
  }

  addEvent() {
    this.selector.addEventListener("click", () => {
      this.onClick();
    });
  }
}
