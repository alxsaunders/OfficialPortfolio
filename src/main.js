import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

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
renderer.toneMappingExposure = 1.2;
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

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased to soften shadows
scene.add(ambientLight);

// Directional Light (Sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly reduced intensity
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.bias = -0.005; // Reduces shadow acne and dark spots
scene.add(directionalLight);

// Light Helper (Optional, for visualization)
// const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
// scene.add(dirLightHelper);

// Fill Light
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-50, 50, -50);
scene.add(pointLight);

// Hemisphere Light for Sky Illumination
const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0xffffff, 0.25);
scene.add(hemisphereLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2 - 0.01;

// Floor (Ground) with PBR Material
const floorGeometry = new THREE.CircleGeometry(1000, 64);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x87ceeb,
  roughness: 0.5,
  metalness: 0
});
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -25;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Sky Sphere
const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('./models/blue.png'),
  side: THREE.BackSide
});
const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skySphere);

// GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  './models/alxisland3.glb',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 1, 0);
    model.scale.set(0.4, 0.4, 0.4);
    
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.roughness *= 0.978;
        node.material.metalness *= 0.5;
        node.material.emissive = new THREE.Color(node.material.emissive || 0x000000);
        node.material.emissiveIntensity = 1.5;
      }
    });

    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('An error occurred loading the model:', error);
  }
);

// Draw
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

// Event Listener for resizing
window.addEventListener('resize', setSize);

draw();
