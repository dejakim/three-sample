import * as THREE from 'three'
import TWEEN from 'tween.js'
import Water from './Water'

const UPDATE_INTERVAL = 16.667;

class App {
  constructor() {
    this.timer = null;
    this.running = false;

    // Initialize
    this.init();
  }

  init() {
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer = renderer;
    // Append render
    $('#container').append(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    this.scene = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 250);
    this.camera = camera;
    scene.add(camera);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    // Make scene
    const water = new Water(256,256,renderer);
    water.mesh.position.z = 0;
    water.mesh.rotation.x = Math.PI * -0.49;
    this.water = water;
    scene.add(water.mesh);

    // Resize handler
    window.addEventListener('resize', ()=>{this.resize();}, false);

    setInterval(()=>{
      for (let i = 0; i < 20; i++) {
        water.drop(new THREE.Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1), 0.03, (i&1) ? 0.5 : -0.5);
      }
    }, 1000);
  }

  resize() {
    const { renderer, camera } = this;
    // Renderer
    renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
    // Camera
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  }

  update() {
    TWEEN.update();
    this.water.update();
  }

  render() {
    const { running, renderer, scene, camera } = this;
    if (running) requestAnimationFrame(this.render.bind(this));

    renderer.render(scene, camera);
  }

  run() {
    // Stop if running
    this.stop();

    // Model update
    this.timer = setInterval(() => { this.update(); }, UPDATE_INTERVAL);

    // View update
    this.running = true;
    this.render();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
  }
}

export default App;
