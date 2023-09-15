export class FilterInit {
  constructor(params) {
    this.filters = [];
    for (let param in params) {
      this[param] = params[param];
    }
  }

  move(id, length) {
    if (this.name == "top") {
      this.dom.style.height = `calc(${id} * 100cqh / ${length})`;
    }
    if (this.name == "bottom") {
      this.dom.style.height = `calc(${length - id - 1} * 100cqh / ${length})`;
    }
  }
}
