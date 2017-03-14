import * as THREE from 'three'
import TWEEN from 'tween.js'
import Dock from './Dock'

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

    // Camera
    const aspect = window.innerWidth/window.innerHeight;
    const camera = new THREE.PerspectiveCamera(19, aspect, 1, 1000);
    camera.position.z = 250;
    this.camera = camera;

    // Scene
    const scene = new THREE.Scene();
    this.scene = scene;

    // Resize handler
    window.addEventListener('resize', ()=>{this.resize();}, false);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff));

    const dock = new Dock([28.5 * aspect,0,100], [23 * aspect,0,100]);
    this.dock = dock;

    scene.add(camera);
    scene.add(dock.mesh);
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

    this.dock.show();
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
