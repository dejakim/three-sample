import * as THREE from 'three'
import TWEEN from 'tween.js'

class Dock {
  constructor(from, to) {
    this.pos = {x:from[0], y:from[1], z:from[2]};
    this.from = {x:from[0], y:from[1], z:from[2]};
    this.to = {x:to[0], y:to[1], z:to[2]};
    this.init(10, 50);
  }

  init(width, height) {
    const { pos } = this;
    const material = new THREE.MeshPhongMaterial({color:0xffffff});
    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;
    this.mesh.position.set(pos.x, pos.y, pos.z);

    this.size = [width, height];
  }

  set size(v) {
    this.mesh.scale.set(v[0], v[1], 1);
  }

  hide() {
    const { to, pos, mesh } = this;
    const tween = new TWEEN.Tween(pos)
    .to({ x: from.x, y: from.y, z: from.z }, 500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(() => {
      mesh.position.set(pos.x, pos.y, pos.z);
    })
    .start();
  }

  show() {
    const { to, pos, mesh } = this;
    const tween = new TWEEN.Tween(pos)
    .to({ x: to.x, y: to.y, z: to.z }, 500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(() => {
      mesh.position.set(pos.x, pos.y, pos.z);
    })
    .start();
  }
}
export default Dock;
