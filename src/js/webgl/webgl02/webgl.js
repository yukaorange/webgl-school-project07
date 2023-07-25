import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shader01/vertex.glsl";
import fragmentShader from "./shader01/fragment.glsl";
import * as dat from "lil-gui";
import { TextureLoader } from "three";

export class Sketch {
  /**
   * Create a Sketch instance.
   * @param {Object} options - Configuration object for the Sketch.
   * @param {HTMLElement} options.dom - The container element for the renderer.
   * @param {Array<string>} options.images - Array of image URLs to load as textures.
   */
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;


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
    this.renderer.setClearColor(0x000000, 1);

    this.clock = new THREE.Clock();
    this.initialY = window.scrollY;

    this.images = options.images;

    this.time = 0;
    this.isPlaying = true;
    this.textures = [];

    this.initiate(() => {
      this.addObjects();
      this.addCamera();
      this.addLight();
      // this.settings();
      // this.addControls();
      this.mouseEvent();
      this.touchEvent();
      this.setupResize();
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
    const promises = this.images.map((image, i) => {
      return new Promise((resolve) => {
        // loadの第二引数は読み込み完了時に実行されるコールバック関数
        this.textures[i] = new THREE.TextureLoader().load(image.src, resolve);
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
      this.resize();

      // clearTimeout(this.resizeTimeout);
      // this.resizeTimeout = setTimeout(() => {
      //   const newWidth = window.innerWidth;
      //   const widthDifference = Math.abs(this.currentWidth - newWidth);

      //   if (widthDifference <= 1) {
      //     // console.log(this.currentWidth, "リサイズなし");
      //     return;
      //   }
      //   this.currentWidth = newWidth;
      //   // console.log(this.currentWidth, "リサイズ検知");
      //   this.resize();
      // }, 10);
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
    this.imageXAspect =
      this.textures[0].source.data.width / this.textures[0].source.data.height;
    this.imageYAspect =
      this.textures[0].source.data.height / this.textures[0].source.data.width;
    this.material.uniforms.uXAspect.value = this.Xaspect / this.imageXAspect;
    this.material.uniforms.uYAspect.value = this.Yaspect / this.imageYAspect;

    this.camera.fov =
      2 * (180 / Math.PI) * Math.atan(this.height / (2 * this.dist));

    let scrollY = window.scrollY - this.initialY;

    this.materials.forEach((m) => {
      m.uniforms.uXAspect.value = this.Xaspect / this.imageXAspect;
      m.uniforms.uYAspect.value = this.Yaspect / this.imageYAspect;
      m.uniforms.uResolution.value.x = this.width * 0.9;
      m.uniforms.uResolution.value.y = this.height * 0.9;
    });

    this.imageStore.forEach((i) => {
      let bounds = i.img.getBoundingClientRect();
      i.mesh.scale.set(bounds.width, bounds.height, 1);
      i.top = bounds.top + scrollY;
      i.left = bounds.left;
      i.width = bounds.width;
      i.height = bounds.height;

      i.mesh.material.uniforms.uQuadSize.value.x = bounds.width;
      i.mesh.material.uniforms.uQuadSize.value.y = bounds.height;
      i.mesh.material.uniforms.uTextureSize.value.x = bounds.width;
      i.mesh.material.uniforms.uTextureSize.value.y = bounds.height;
    });

    // this.plane.scale.x = this.width; //もとのplaneは１×１なので、全画面にしたいときはリサイズ時に引き伸ばす
    // this.plane.scale.y = this.height; //縦方向も同様
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
    this.dist = 600;
    this.camera = new THREE.PerspectiveCamera(
      fov, //画角
      this.width / this.height, //アスペクト比
      0.001, //カメラからの距離の最小値
      10000 //カメラからの距離の最大値
    );

    this.camera.position.set(0, 0, this.dist);
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

    lights.forEach((light) => {
      this.scene.add(light);
    });
  }
  /**
   * Add objects to the scene.
   */
  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives:",
      },
      wireframe: false,
      uniforms: {
        time: {
          value: 0,
        },
        uXAspect: {
          //画面のアスペクト比と画像のアスペクト比の比率
          value: this.Xaspect / this.imageXAspect,
        },
        uYAspect: {
          //画面のアスペクト比と画像のアスペクト比の比率
          value: this.Yaspect / this.imageYAspect,
        },
        uProgress: {
          value: this.settings.progress,
        },
        uTexture: {
          value: this.textures[0],
        },
        uTextureSize: {
          value: new THREE.Vector2(100, 100),
        },
        uResolution: {
          //画面の解像度
          value: new THREE.Vector2(this.width, this.height),
        },
        uQuadSize: {
          value: new THREE.Vector2(300, 300),
        },
        uCorners: {
          value: new THREE.Vector4(0, 0, 0, 0),
        },
        mouse: {
          value: new THREE.Vector2(0, 0),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
    // this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);//全画面表示では元のスケールは正規化しておく
    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100);
    this.plane = new THREE.Mesh(this.geometry, this.material);

    // this.plane.position.x = 300;
    // this.plane.scale.set(300, 300, 1);
    // this.scene.add(this.plane);

    this.materials = [];

    this.imageStore = this.images.map((img, i) => {
      let bounds = img.getBoundingClientRect();
      let m = this.material.clone();
      this.materials.push(m);
      let texture = this.textures[i];
      texture.needsUpdate = true;

      m.uniforms.uTexture.value = texture;
      // m.uniforms.uProgressについて、クローン元のプロパティの値の変化はクローンには影響しない。

      img.addEventListener("click", () => {
        mesh.renderOrder = 1;
        this.tl = gsap.timeline();
        this.tl
          .to(this.container, {
            zIndex: 1,
          })
          .to(m.uniforms.uCorners.value, {
            x: 1,
            duration: 0.4,
          })
          .to(
            m.uniforms.uCorners.value,
            {
              y: 1,
              duration: 0.4,
            },
            0.2
          )
          .to(
            m.uniforms.uCorners.value,
            {
              z: 1,
              duration: 0.4,
            },
            0.4
          )
          .to(
            m.uniforms.uCorners.value,
            {
              w: 1,
              duration: 0.4,
            },
            0.6
          );

        this.container.addEventListener("click", () => {
          mesh.renderOrder = 0;
          this.tl = gsap.timeline();
          this.tl
            .to(this.container, {
              zIndex: -1,
            })
            .to(m.uniforms.uCorners.value, {
              x: 0,
              duration: 0.4,
            })
            .to(
              m.uniforms.uCorners.value,
              {
                y: 0,
                duration: 0.4,
              },
              0.2
            )
            .to(
              m.uniforms.uCorners.value,
              {
                z: 0,
                duration: 0.4,
              },
              0.4
            )
            .to(
              m.uniforms.uCorners.value,
              {
                w: 0,
                duration: 0.4,
              },
              0.6
            );
        });
      });

      let mesh = new THREE.Mesh(this.geometry, m);
      mesh.frustumCulled = false;
      this.scene.add(mesh);

      mesh.scale.set(bounds.width, bounds.height, 1);

      return {
        img: img,
        mesh: mesh,
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        left: bounds.left,
      };
    });
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
    });
    window.addEventListener("mouseup", () => {
      this.mouseFlg = false;
    });
  }
  //タッチイベント
  touchEvent() {
    this.mouseFlg = false;
    window.addEventListener("touchstart", () => {
      this.mouseFlg = true;
    });
    window.addEventListener("touchend", () => {
      this.mouseFlg = false;
    });
  }

  setPositon() {
    let scrollY = window.scrollY - this.initialY;
    this.imageStore.forEach((o, i) => {
      o.mesh.position.x = o.left - this.width / 2 + o.width / 2; //+o.width/2は、画像の中心を原点にする
      o.mesh.position.y = scrollY - o.top + this.height / 2 - o.height / 2; //-o.height/2は、画像の中心を原点にする
    });
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

    // this.material.uniforms.time.value = this.time;

    // this.material.uniforms.uProgress.value = this.settings.progress;

    this.setPositon();

    // this.tl.progress(this.settings.progress);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}
