import { gsap } from "gsap";
import { HorizontalSlider } from "./HorizontalSlider";
import { FadeOutSlider } from "./FadeOutSlider";
/**
 * ２種類のスライダーを設定する
 */
let scrollElements;
let horizontalSlider;
let fadeOutSlider;

// スクロール時のハンドラ関数
const scrollHandler = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollElements && scrollElements.length > 0) {
    scrollElements.forEach((element, index) => {
      const rectTop = element.getBoundingClientRect().top;
      const height = element.offsetHeight;
      const scrollPos = scrollTop + rectTop;
      const scrollDiff = scrollTop - scrollPos;
      const heightDiff = height - window.innerHeight;
      const scrollRatio = Math.max(0, Math.min(1, scrollDiff / heightDiff));
      console.log(`scrollRatio: ${scrollRatio}`);
      if (index === 0 && horizontalSlider) {
        horizontalSlider.scroll(scrollRatio);
      }
      if (index === 1 && fadeOutSlider) {
        fadeOutSlider.scroll(scrollRatio);
      }
    });
  }
};

export const init = () => {
  scrollElements = document.querySelectorAll("[data-content-sticky]");

  const horizontalSliderElement = document.querySelector(
    '[data-scroll-slider="0"]'
  );

  const fadeOutSliderElement = document.querySelector(
    '[data-scroll-slider="1"]'
  );

  if (horizontalSliderElement) {
    horizontalSlider = new HorizontalSlider({
      element: horizontalSliderElement,
      onResizeEnd: () => {
        scrollHandler();
      },
    });
    horizontalSlider.initialize();
  }

  if (fadeOutSliderElement) {
    fadeOutSlider = new FadeOutSlider({
      element: fadeOutSliderElement,
      onResizeEnd: () => {
        scrollHandler();
      },
    });
    fadeOutSlider.initialize();
  }
  window.addEventListener("scroll", () => {
    scrollHandler();
  });
  scrollHandler();
};
