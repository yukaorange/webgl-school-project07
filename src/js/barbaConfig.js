import barba from "@barba/core";
import gsap from "gsap";

initHeight();
function initHeight() {
  const barbaContainerHeight =
    document.querySelector(".barba-container").clientHeight;
  const barbaWrapper = document.querySelector(".barba-wrapper");
  barbaWrapper.style.height = barbaContainerHeight + "px";

  window.addEventListener("resize", () => {
    const barbaContainerHeight =
      document.querySelector(".barba-container").clientHeight;
    const barbaWrapper = document.querySelector(".barba-wrapper");
    barbaWrapper.style.height = barbaContainerHeight + "px";
  });
}

barba.init({
  transitions: [
    {
      sync: true,
      name: "opacity-transition",
      leave(data) {
        const tl = gsap.timeline();

        tl.to(data.current.container, {
          duration: 1,
          clipPath: "polygon(0 0, 0% 0, 0% 100%, 0% 100%)",
        });

        tl.to(
          data.current.container,
          {
            duration: 1,
            xPercent: -0,
          },
          "0.5"
        );
        return tl;
      },
      enter(data) {
        return gsap.from(data.next.container, {
          duration: 1,
          xPercent: 0,
          clipPath: " polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
          onUpdate: () => {
            data.next.container.style.transformOrigin = "100% 100%";
            window.scrollTo(0, 0);
          },
          onComplete: () => {
            const barbaWrapper = document.querySelector(".barba-wrapper");
            barbaWrapper.style.height = data.next.container.clientHeight + "px";
          },
        });
      },
    },
  ],
});
