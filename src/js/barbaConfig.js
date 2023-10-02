import barba from "@barba/core";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/all";
gsap.registerPlugin(ScrollToPlugin);

const barbaContainer = document.querySelector(".barba-container");

function initHeight(barbaContainer) {
  const barbaContainerHeight = barbaContainer.clientHeight;
  const barbaWrapper = document.querySelector(".barba-wrapper");
  barbaWrapper.style.height = barbaContainerHeight + "px";

  window.addEventListener("resize", () => {
    const barbaContainerHeight = barbaContainer.clientHeight;
    const barbaWrapper = document.querySelector(".barba-wrapper");
    barbaWrapper.style.height = barbaContainerHeight + "px";
  });
}

if (barbaContainer) {
  initHeight(barbaContainer);

  barba.init({
    transitions: [
      {
        sync: true,
        name: "opacity-transition",
        leave(data) {
          const tl = gsap.timeline();

          tl.to(data.current.container, {
            duration: 1.5,
            clipPath: "polygon(0 0, 0% 0, 0% 100%, 0% 100%)",
          });

          tl.to(
            data.current.container,
            {
              duration: 1.5,
              xPercent: -0,
            },
            "0.5"
          );
          return tl;
        },
        enter(data) {
          const tl = gsap.timeline();
          tl.from(data.next.container, {
            duration: 1.5,
            clipPath: " polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
            onUpdate: () => {
              data.next.container.style.transformOrigin = "100% 100%";
            },
            onComplete: () => {
              const barbaWrapper = document.querySelector(".barba-wrapper");
              barbaWrapper.style.height =
                data.next.container.clientHeight + "px";
            },
          });
          tl.to(
            window,
            {
              duration: 0.6,
              scrollTo: 0,
            },
            "0.8"
          );

          return tl;
        },
      },
    ],
  });
}

//読み込んだコンテンツのスクロール位置をリセットしているようなテクニックは、bodyのスクロールを使わずに、containerなりでスクロール、つまりbodyはheight100vhにして、そしてcontainerはheight100%にしてoverflow:scrollにするという方法があります。このとき、スクロールプラグインはlenis。参考サイトhttps://www.bowte.jp/about/
