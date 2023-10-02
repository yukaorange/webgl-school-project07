import { gsap } from "gsap";
import * as dat from "lil-gui";
import * as THREE from "three";
import { TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import vertexShader from "./shader/vertex.glsl";
// import fragmentShader from "./shader/fragment.glsl";

export class Sketch {
  /**
   * Create a Sketch instance.
   * @param {Object} options - Configuration object for the Sketch.
   * @param {HTMLElement} options.dom - The container element for the renderer.
   * @param {Array} options.images - An array of image URLs to use as textures.
   */
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;
    this.images = options.images;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.Xaspect = this.width / this.height;
    this.Yaspect = this.height / this.width;
    //rendererについて、canvasがあればそれを使う
    let canvas = this.container.querySelector("canvas");
    if (canvas) {
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas });
    } else {
      this.renderer = new THREE.WebGLRenderer();
      this.container.appendChild(this.renderer.domElement);
    }
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xffffff, 0);

    this.clock = new THREE.Clock();
    this.time = 0;
    this.isPlaying = true;
    this.textures = [];
    //波のアニメーションについて
    this.animationInterval = 5; // アニメーションが発生する間隔 (秒)
    this.animationDuration = 1; // アニメーションの持続時間 (秒)
    this.lastAnimationTime = 0; // 最後にアニメーションが開始された時間

    this.initiate(() => {
      console.log("initiate");
      this.setupResize();
      this.addObjects();
      this.addCamera();
      this.addLight();
      // this.settings();
      // this.addControls();
      this.mouseEvent();
      this.touchEvent();
      this.resize();
      this.play();
      this.render();
    });
  }

  /**
   * Load textures and execute the callback function.
   * @param {Function} cb - Callback function to execute after loading textures.
   */
  initiate(cb) {
    const promises = this.images.map((url, i) => {
      return new Promise(resolve => {
        // loadの第二引数は読み込み完了時に実行されるコールバック関数
        this.textures[i] = new THREE.TextureLoader().load(url, resolve);
      });
    });

    // texturesを全て読み込んだら実行される
    Promise.all(promises).then(() => {
      cb.bind(this)();
    });
  }

  /**
   * Initialize GUI settings.
   */
  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }
  /**
   * Set up the window resize event listener.
   */
  setupResize() {
    this.currentWidth = window.innerWidth;
    this.resizeTimeout = null;

    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const widthDifference = Math.abs(this.currentWidth - newWidth);

        if (widthDifference <= 10) {
          console.log(this.currentWidth, "リサイズなし");
          return;
        }

        this.currentWidth = newWidth;
        console.log(this.currentWidth, "リサイズ検知");
        this.resize();
      }, 100);
    });
  }
  /**
   * Update Sketch dimensions and aspect ratios on window resize.
   */
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.Xaspect = this.width / this.height;
    this.Yaspect = this.height / this.width;
    this.camera.aspect = this.width / this.height;
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }
  /**
   * Add the camera to the scene.
   */
  addCamera() {
    //perspectiveで画面いっぱいにオブジェクトを映す場合
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    this.dist = 15; //オブジェクトの大きさを変えずに映す場合
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.001,
      100
    );

    this.camera.position.set(5, 5, this.dist);
  }
  /**controls
   */
  addControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  /**
   * Add lights to the scene.
   */
  addLight() {
    const lights = [];

    const DirLight = new THREE.DirectionalLight(0xf8f8f8, 1);
    DirLight.position.set(0, 2, 3);
    lights.push(DirLight);

    const AmbientLight = new THREE.AmbientLight(0xf8f8f8, 0.5);
    lights.push(AmbientLight);

    lights.forEach(light => {
      this.scene.add(light);
    });
  }
  /**
   * Add objects to the scene.
   */
  addObjects() {
    this.material = new THREE.MeshPhongMaterial({ map: this.textures[0] });
    this.transparentMaterial = new THREE.MeshPhongMaterial({
      map: this.textures[0],
      transparent: true,
      opacity: 0.25,
    });
    const size = 1;
    const count = 5;
    this.initialGap = 0.25;
    this.gap = this.initialGap;
    this.geometry = new THREE.BoxGeometry(size, size, size);

    let centerOffset = (count * size) / 2;
    this.meshArray = [];
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        for (let z = 0; z < count; z++) {
          const plane = new THREE.Mesh(this.geometry, this.material);
          if (
            (x > 0 && x < count - 1 && y > 0 && y < count - 1) ||
            (x > 0 && x < count - 1 && z > 0 && z < count - 1) ||
            (y > 0 && y < count - 1 && z > 0 && z < count - 1)
          ) {
            plane.material = this.transparentMaterial;
          }
          plane.position.x = x * (size + this.gap) - centerOffset;
          plane.position.y = y * (size + this.gap) - centerOffset;
          plane.position.z = z * (size + this.gap) - centerOffset;
          //初期位置
          plane.initialPositionX = plane.position.x;
          plane.initialPositionY = plane.position.y;
          plane.initialPositionZ = plane.position.z;
          //最大拡散位置
          plane.maxPositionX = plane.initialPositionX * 1.2;
          plane.maxPositionY = plane.initialPositionY * 1.2;
          plane.maxPositionZ = plane.initialPositionZ * 1.2;
          //アニメション
          const delay = -(x + z) * 0.1;
          plane.tween = gsap.to(plane.position, {
            keyframes: [{ y: "+=2" }, { y: "-=2" }],
            repeat: -1,
            repeatDelay: 4,
            paused: true, // Start with the animation paused
            duration: 1, // Change to however long you want the animation to last
            delay: delay,
            ease: "power2.inOut",
          });

          this.scene.add(plane);
          this.meshArray.push(plane);
        }
      }
    }
    console.log(this.meshArray[0].position.x);
  }
  /**
   * Stop the rendering loop.
   */
  stop() {
    this.isPlaying = false;
  }
  /**
   * Resume the rendering loop.
   */
  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  //マウスイベント
  mouseEvent() {
    this.mouseFlg = false;
    window.addEventListener("mousedown", () => {
      this.mouseFlg = true;
      this.updateGap();
    });
    window.addEventListener("mouseup", () => {
      this.mouseFlg = false;
      this.updateGap();
    });
  }
  //タッチイベント
  touchEvent() {
    this.mouseFlg = false;
    window.addEventListener("touchstart", () => {
      this.mouseFlg = true;
      this.updateGap();
    });
    window.addEventListener("touchend", () => {
      this.mouseFlg = false;
      this.updateGap();
    });
  }
  updateGap() {
    if (this.mouseFlg) {
      this.gap = this.initialGap * 1.25; // or any value greater than this.initialGap
      this.meshArray.forEach(plane => {
        gsap.to(plane.position, {
          x: `+=${plane.initialPositionX * this.gap}`,
          y: `+=${plane.initialPositionY * this.gap}`,
          z: `+=${plane.initialPositionZ * this.gap}`,
          duration: 0.4, // Animation duration
          ease: "power2.inOut",
        });
      });
    } else {
      this.gap = this.initialGap;
      this.meshArray.forEach(plane => {
        gsap.to(plane.position, {
          x: plane.initialPositionX,
          y: plane.initialPositionY,
          z: plane.initialPositionZ,
          duration: 0.4, // Animation duration
          ease: "power2.inOut",
        });
      });
    }
  }

  /**
   * Render the scene.
   */
  render() {
    if (!this.isPlaying) {
      return;
    }
    const elapsedTime = this.clock.getElapsedTime();
    this.time = elapsedTime;
    if (this.mouseFlg == false) {
      this.meshArray.forEach(mesh => mesh.tween.play());
    }
    if (this.mouseFlg == true) {
      this.meshArray.forEach(mesh => mesh.tween.pause());
    }

    const radius = 15;
    const speed = 0.25;
    this.camera.position.x = radius * Math.cos(speed * this.time);
    this.camera.position.z = radius * Math.sin(speed * this.time);
    this.camera.lookAt(this.scene.position);

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
