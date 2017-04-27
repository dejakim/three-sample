import * as THREE from 'three'
// import GPURenderer from './lib/GPURenderer'


class Water {
  constructor(width, height, renderer) {

    this.renderer = renderer;
    this.index = 0;

    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
    this.camera.position.z = 1;

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2));
    this.scene.add(this.quad);

    // FBO
    const params = {
  		minFilter: THREE.NearestFilter,
  		magFilter: THREE.NearestFilter,
  		wrapS: THREE.RepeatWrapping,
  		wrapT: THREE.RepeatWrapping,
  		format: THREE.RGBAFormat,
  		stencilBuffer: false,
  		depthBuffer: false,
  		// premultiplyAlpha: false,
  		type: THREE.FloatType
  	};
    this.fbo = [
      new THREE.WebGLRenderTarget(256, 256, params),
      new THREE.WebGLRenderTarget(256, 256, params)
    ];

    // shader
    this.dropMaterial = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4( position, 1.0 ); }',
      fragmentShader: '\
      const float PI = 3.141592653589793;\
      uniform sampler2D texture;\
      uniform vec2 resolution;\
      uniform vec2 center;\
      uniform float radius;\
      uniform float strength;\
      void main() {\
        vec2 uv = gl_FragCoord.xy / resolution.xy;\
        /* get vertex info */\
        vec4 v = texture2D(texture, uv);\
        /* add the drop to the height */\
        float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - uv) / radius);\
        drop = 0.5 - cos(drop * PI) * 0.5;\
        v.r += drop * strength;\
        gl_FragColor = v;\
      }',
      uniforms: {
        'texture'    : { type : "t" , value : null },
        'resolution' : { type : "v2", value : new THREE.Vector2(256, 256) },
        'center'     : { type : "v2", value : new THREE.Vector2() },
        'radius'     : { type : "f" , value : 0.01 },
        'strength'   : { type : "f" , value : 1.0 }
      }
    });

    this.updateMaterial = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4( position, 1.0 ); }',
      fragmentShader: '\
      uniform sampler2D texture;\
      uniform vec2 resolution;\
      uniform vec2 delta;\
      void main() {\
        vec2 uv = gl_FragCoord.xy / resolution.xy;\
        vec4 v = texture2D(texture, uv);\
        /* calculate average neighbor height */\
        vec2 dx = vec2(delta.x, 0.0);\
        vec2 dy = vec2(0.0, delta.y);\
        float avg = (\
          texture2D(texture, uv - dx).r +\
          texture2D(texture, uv - dy).r +\
          texture2D(texture, uv + dx).r +\
          texture2D(texture, uv + dy).r\
        ) * 0.25;\
        /* change the velocity to move toward the average */\
        v.g += (avg - v.r) * 2.0;\
        /* attenuate the velocity a little so waves do not last forever */\
        v.g *= 0.995;\
        /* move the vertex along the velocity */\
        v.r += v.g;\
        gl_FragColor = v;\
      }',
      uniforms: {
        'texture'    : { type : "t" , value : null },
        'resolution' : { type : "v2", value : new THREE.Vector2(256, 256) },
        'delta'      : { type : "v2", value : new THREE.Vector2(1./256, 1./256) },
      }
    });

    this.normalMaterial = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4( position, 1.0 ); }',
      fragmentShader: '\
      uniform sampler2D texture;\
      uniform vec2 resolution;\
      uniform vec2 delta;\
      void main() {\
        vec2 uv = gl_FragCoord.xy / resolution.xy;\
        vec4 v = texture2D(texture, uv);\
        /* update the normal */\
        vec3 dx = vec3(delta.x, texture2D(texture, vec2(uv.x + delta.x, uv.y)).r - v.r, 0.0);\
        vec3 dy = vec3(0.0, texture2D(texture, vec2(uv.x, uv.y + delta.y)).r - v.r, delta.y);\
        v.ba = normalize(cross(dy, dx)).xz;\
        gl_FragColor = v;\
      }',
      uniforms: {
        'texture'    : { type : "t" , value : null },
        'resolution' : { type : "v2", value : new THREE.Vector2(256, 256) },
        'delta'      : { type : "v2", value : new THREE.Vector2(1./256, 1./256) },
      }
    });

    this.mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(width,height,255,255),
      new THREE.ShaderMaterial({
        uniforms: {
          'watermap' : { type : "t" , value : null }
        },
        vertexShader: '\
        uniform sampler2D watermap;\
        void main() {\
          vec3 p = position;\
          vec4 v = texture2D(watermap, uv);\
          p.z += v.r * 10.0;\
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);\
        }',
        fragmentShader: '\
        void main() {\
          gl_FragColor = vec4(1.0,0.5,0.5,1.0);\
        }'
      })
    );
  }

  drop(center, radius, strength) {
    const { quad, dropMaterial, fbo, scene, camera, renderer } = this;

    const currIndex = this.index;
    const nextIndex = (currIndex + 1) & 0x1;

    quad.material = dropMaterial;
    quad.material.uniforms.center.value = center;
    quad.material.uniforms.radius.value = radius;
    quad.material.uniforms.strength.value = strength;
    quad.material.uniforms.texture.value = fbo[currIndex].texture;
    renderer.render(scene, camera, fbo[nextIndex]);

    this.index = nextIndex;
  }

  update() {
    const { mesh, quad, updateMaterial, normalMaterial, fbo, scene, camera, renderer } = this;

    const currIndex = this.index;
    const nextIndex = (currIndex + 1) & 0x1;
    // Smooth
    quad.material = updateMaterial;
    quad.material.uniforms.texture.value = fbo[currIndex].texture;
    renderer.render(scene, camera, fbo[nextIndex]);

    quad.material.uniforms.texture.value = fbo[nextIndex].texture;
    renderer.render(scene, camera, fbo[currIndex]);

    // Calculate Normal
    quad.material = normalMaterial;
    quad.material.uniforms.texture.value = fbo[currIndex].texture;
    renderer.render(scene, camera, fbo[nextIndex]);

    this.index = nextIndex;
    mesh.material.uniforms.watermap.value = fbo[this.index].texture;
  }
}

export default Water;
