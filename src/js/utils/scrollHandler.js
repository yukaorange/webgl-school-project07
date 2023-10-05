export class ScrollAmountHandler {
  constructor({ targetDom }) {
    this.scrollAmount = 0
    this.target = targetDom
    this.scrollY = window.scrollY
    this.targetPosition = this.target.getBoundingClientRect().top
    this.scrollPosition = this.scrollY + this.targetPosition
    this.scrollAmount = this.scrollY - this.scrollPosition
    this.targetHeight = this.target.offsetHeight
    this.AmountOfDiff = this.targetHeight - window.innerHeight
    this.scrollRatio = 0
  }
  
  update() {
    this.scrollY = window.scrollY
    this.targetPosition = this.target.getBoundingClientRect().top
    this.scrollPosition = this.scrollY + this.targetPosition
    this.scrollAmount = this.scrollY - this.scrollPosition
    this.targetHeight = this.target.offsetHeight
    this.AmountOfDiff = this.targetHeight - window.innerHeight
    this.scrollRatio = Math.max(0, Math.min(1.0, this.scrollAmount / this.AmountOfDiff))
  }
  
  getScrollRatio() {
    return this.scrollRatio
  }
}
