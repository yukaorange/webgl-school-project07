import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export class Slideshow {
  constructor(element) {
    this.interval = 6000;
    this.crearance = 1;
    this.elements = {
      hero: document.querySelector(".slideshow"),
      container: element,
      svg: element.querySelector("svg"),
      images: Array.from(element.querySelectorAll("svg image")),
      currentImage: null,
      mask: element.querySelector("svg clipPath"),
      rectangles: [],
    };
    this.width = parseInt(this.elements.svg.getAttribute("width"), 10);
    this.height = parseInt(this.elements.svg.getAttribute("height"), 10);
    this.currentIndex = 0;
    this.totalImages = this.elements.images.length;
    this.totalMasks = parseInt(
      this.elements.container.dataset.totalMasks || 10,
      10
    );
    this.maskId = this.elements.mask.getAttribute("id");
    this.isCreated = false;
    this.isActive = false;
    this.isChanging = false;
    this.scrollTrigger = null;
    this.timer = null;
  }

  create() {
    if (!this.isCreated && this.elements.images.length) {
      this.isCreated = true;
      this.updateSize();
      this.createRectangles();
      this.slideTo(0);
      this.elements.container.classList.add("is-created");
    }
  }

  updateSize() {
    const image = this.elements.images[0],
      imageWidth = parseInt(image.getAttribute("width"), 10),
      imageHeight = parseInt(image.getAttribute("height"), 10);
    this.width = imageWidth;
    this.height = imageHeight;
    this.elements.svg.setAttribute("width", imageWidth);
    this.elements.svg.setAttribute("height", imageHeight);
    this.elements.svg.setAttribute(
      "viewBox",
      `0 0 ${imageWidth} ${imageHeight}`
    );
  }

  createRectangles() {
    const rectangleHeight = this.height / this.totalMasks;
    for (let i = 0; i < this.totalMasks; i++) {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", -1);
      rect.setAttribute("y", i * rectangleHeight - 1);
      rect.setAttribute("width", this.width + 2);
      rect.setAttribute("height", rectangleHeight + 2);
      this.elements.mask.append(rect);
    }
    this.elements.rectangles = Array.from(
      this.elements.mask.querySelectorAll("rect")
    );
  }

  waitForAnimation(duration) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  async slideTo(targetIndex) {
    if (this.isChanging) return;
    this.isChanging = true;
    const targetImage = this.elements.images[targetIndex];
    this.elements.svg.prepend(targetImage); //add target image to the top of sentence(svg)
    targetImage.setAttribute("opacity", 1);
    if (this.elements.currentImage) {
      gsap.set(this.elements.rectangles, { x: 0 });
      this.elements.currentImage.setAttribute(
        "clip-path",
        `url(#${this.maskId})`
      ); // setting clip-path to current image
      gsap.fromTo(
        targetImage,
        {
          scale: 1.2,
          transformOrigin: "center center",
        },
        {
          scale: 1,
          duration: 3.2,
          ease: "power4.out",
        }
      ); // same timing as the clip-path animation
      await Promise.all(
        //gsap is using requestAnimationFrame, caz animation is running in parallel.
        this.elements.rectangles.map((rectangle, i) => {
          // const distance = i % 2 === 0 ? this.width + 1 : -1 * (this.width + 1);
          const distance = i % 2 === 0 ? this.width + 1 : -1 * (this.width + 1);
          return gsap
            .to(rectangle, {
              x: distance,
              duration: 1,
              ease: "expo.inOut",
              delay: 0.08 * i,
            })
            .then();
        })
      ); // waiting next process until all animations are finished

      //⇧you can use this tequnique when you want to wait all animations are finished

      this.elements.currentImage.setAttribute("opacity", 0);
      this.elements.currentImage.setAttribute("clip-path", "");
    }
    this.isChanging = false;
    this.currentIndex = targetIndex;
    this.elements.currentImage = targetImage;
  }

  next() {
    const nextIndex =
      this.currentIndex === this.totalImages - 1 ? 0 : this.currentIndex + 1;
    this.slideTo(nextIndex);
  }

  on() {
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.elements.hero,
      start: "top bottom",
      onEnter: () => {
        this.start();
      },
      onEnterBack: () => {
        this.start();
      },
      onLeave: () => {
        this.stop();
      },
      onLeaveBack: () => {
        this.stop();
      },
    });
  }

  off() {
    this.scrollTrigger && this.scrollTrigger.kill();
    this.stop();
  }

  loop(customInterval) {
    const interval =
      customInterval !== undefined ? customInterval : this.interval;
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.isActive) {
        this.next();
        this.loop();
      }
    }, interval);
  }

  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.loop(600);
    }
  }

  stop() {
    if (this.isActive) {
      this.isActive = false;
    }
  }
}
