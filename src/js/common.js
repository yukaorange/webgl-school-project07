// import { gsap } from "gsap";

/**
 * drawerMenu
 * @param {button,drawerNav,drawerButton}
 * @//return,type {}
 */
export class DrawerMenu {
  constructor(buttonSelector, drawerNavSelector, drawerNavButtonSelector) {
    this.drawerButton = document.querySelector(buttonSelector)
    this.nav = document.querySelector(drawerNavSelector)
    this.navButtons = document.querySelectorAll(drawerNavButtonSelector)

    // aria attributes
    this.nav.setAttribute('aria-hidden', 'true')
    this.drawerButton.setAttribute('aria-expanded', 'false')
    this.drawerButton.setAttribute('aria-controls', this.nav.id)

    this._setupEventListeners()
  }

  _setupEventListeners() {
    this.drawerButton.addEventListener('click', () => this.toggleMenu())
    this.navButtons.forEach((button) => {
      button.addEventListener('click', () => this.closeMenu())
    })
    this.nav.addEventListener('click', (e) => {
      if (e.target === this.nav) {
        this.closeMenu()
      }
    })
  }

  toggleMenu() {
    const isActive = this.drawerButton.classList.toggle('active')
    this.nav.classList.toggle('active')

    // Update the text and aria attributes
    const text = isActive ? 'close' : 'menu'
    this.drawerButton.querySelector('span').textContent = text
    this.drawerButton.setAttribute('aria-expanded', isActive)
    this.nav.setAttribute('aria-hidden', !isActive)
  }

  closeMenu() {
    this.drawerButton.classList.remove('active')
    this.nav.classList.remove('active')
    this.drawerButton.querySelector('span').textContent = 'menu'

    // Update the aria attributes
    this.drawerButton.setAttribute('aria-expanded', 'false')
    this.nav.setAttribute('aria-hidden', 'true')
  }
}

export function setViewPort() {
  let vw = window.innerWidth
  let documentWidth = document.documentElement.clientWidth
  let scrollBarWidth = vw - documentWidth
  let ajustWidth = vw - scrollBarWidth

  document.documentElement.style.setProperty('--vw', `${ajustWidth}px`)

  window.addEventListener('resize', () => {
    vw = window.innerWidth
    documentWidth = document.documentElement.clientWidth
    scrollBarWidth = vw - documentWidth
    ajustWidth = vw - scrollBarWidth

    document.documentElement.style.setProperty('--vw', `${ajustWidth}px`)
  })
}
