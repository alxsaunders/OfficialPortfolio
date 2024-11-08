import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { RGBELoader } from 'three/addons/loaders/RGBELoader';

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;  // Reduced from 1.2 to decrease overall brightness
renderer.physicallyCorrectLights = true;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdedede);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(35, 35, 30);
scene.add(camera);

// Load environment map
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
  .setPath('./models/')
  .load('sky.hdr', function(texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;  // Set as scene's environment map
    scene.background = envMap;   // Optional: use same HDR as background
    
    texture.dispose();
    pmremGenerator.dispose();
});

// Lights (further reduced intensity)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);  // Reduced from 0.3
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.01);  // Reduced from 0.5
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;  // Increased from 2048
directionalLight.shadow.mapSize.height = 4096; 
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 300;
directionalLight.shadow.camera.left = -75;
directionalLight.shadow.camera.right = 75;
directionalLight.shadow.camera.top = 75;
directionalLight.shadow.camera.bottom = -75;
directionalLight.shadow.bias = -0.001;
directionalLight.intensity = 0.35; 
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.2);  // Reduced from 0.3
pointLight.position.set(-50, 50, -50);
scene.add(pointLight);

const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0xffffff, 0.05);  // Reduced from 0.15
scene.add(hemisphereLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2 - 0.01;


// GLTF Loader with adjusted material properties
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  './models/alxisland90.glb',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 1, 0);
    model.scale.set(0.5, 0.5, 0.5);
    
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        
        // Adjusted material properties for less intense reflections
        if (node.material) {
          node.material.roughness *= 0.97;  // Increased from 0.97 to reduce reflections
          node.material.metalness *= 0.6;  // Reduced from 0.8
          node.material.envMapIntensity = 0.8;  // Reduced from 1.2
          node.material.needsUpdate = true;
        }
      }
    });

    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('An error occurred loading the model:', error);
  }
);

const clock = new THREE.Clock();

function draw() {
  const delta = clock.getDelta();
  controls.update();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

function setSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

window.addEventListener('resize', setSize);

draw();