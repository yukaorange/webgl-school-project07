export class clickableAreasInit {
  constructor(params) {
    this.list = [];
    for (let param in params) {
      this[param] = params[param];
    }
    this.init();
  }

  init() {
    this.items.forEach((item, id) => {
      this.list.push(
        new clickableItems({ dom: item, id: id, onClick: this.onChange })
      );
    });
  }
}

class clickableItems {
  constructor(params) {
    this.id = null;
    for (let param in params) {
      this[param] = params[param];
    }
    this.addEvent();
  }

  addEvent() {
    this.dom.addEventListener("click", () => {
      this.onClick(this.id);
    });
  }
}
