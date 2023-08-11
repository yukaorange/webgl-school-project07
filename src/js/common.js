import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/**
 * drawerMenu
 * @param {button,drawerNav,drawerButton}
 * @//return,type {}
 */
export function drawerMenu(button, drawerNav, drawerNavButton) {
  const drawerButton = document.querySelector(button);
  const nav = document.querySelector(drawerNav);
  const navButton = document.querySelectorAll(drawerNavButton);

  //トグルボタン
  drawerButton.addEventListener("click", function () {
    drawerButton.classList.toggle("active");
    nav.classList.toggle("active");
    if (drawerButton.classList.contains("active")) {
      drawerButton.querySelector("span").textContent = "close";
    } else {
      drawerButton.querySelector("span").textContent = "menu";
    }
  });
  //各リンククリックでドロワークローズ
  navButton.forEach((el) => {
    el.addEventListener("click", () => {
      if (
        drawerButton.classList.contains("active") ||
        nav.classList.contains("active")
      ) {
        drawerButton.classList.remove("active");
        nav.classList.remove("active");
        drawerButton.querySelector("span").textContent = "menu";
      }
    });
  });
  //メニューボタン領域外クリックでもクローズ
  nav.addEventListener("click", () => {
    if (
      drawerButton.classList.contains("active") ||
      nav.classList.contains("active")
    ) {
      drawerButton.classList.remove("active");
      nav.classList.remove("active");
      drawerButton.querySelector("span").textContent = "menu";
    }
  });
}
