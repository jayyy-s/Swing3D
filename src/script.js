import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Base
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Axes helper
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

// Textures
const textureLoader = new THREE.TextureLoader();
const topBarMatcap = textureLoader.load("./textures/matcaps/metal.png");
const archMatcap = textureLoader.load("./textures/matcaps/1.png");
const ropeMatcap = textureLoader.load("./textures/matcaps/alien.png");
const swingSeatMatcap = textureLoader.load("./textures/matcaps/seat.png");

// Objects
const topBarMaterial = new THREE.MeshMatcapMaterial({ matcap: topBarMatcap });
const archMaterial = new THREE.MeshMatcapMaterial({ matcap: archMatcap });
const ropeMaterial = new THREE.MeshMatcapMaterial({ matcap: ropeMatcap });
const swingSeatMaterial = new THREE.MeshMatcapMaterial({
  matcap: swingSeatMatcap,
});

// Top Bar
const topBarGeometry = new THREE.CylinderGeometry(1 / 16, 1 / 16, 6);
const topBar = new THREE.Mesh(topBarGeometry, topBarMaterial);
topBar.rotation.z = Math.PI * 0.5;
topBar.position.y = 2;

gui.add(topBar.position, "y").min(0).max(2).step(0.0001).name("Top Bar Y");

// Arches
const leftArch = new THREE.Group();

const archFrontGeometry = new THREE.CylinderGeometry(1 / 16, 1 / 16, 3.75);
const archFront = new THREE.Mesh(archFrontGeometry, archMaterial);
archFront.rotation.x = -Math.PI * 0.125;
archFront.position.z = 0.7159;
archFront.position.y = 0.2209;

gui
  .add(archFront.position, "z")
  .min(-1)
  .max(1)
  .step(0.0001)
  .name("ArchFront Z");
gui
  .add(archFront.position, "y")
  .min(-1)
  .max(1)
  .step(0.0001)
  .name("ArchFront Y");

const archBackGeometry = new THREE.CylinderGeometry(1 / 16, 1 / 16, 3.75);
const archBack = new THREE.Mesh(archBackGeometry, archMaterial);
archBack.rotation.x = Math.PI * 0.125;
archBack.position.z = -0.7159;
archBack.position.y = 0.2209;

debugObject.leftArchX = 0;
gui
  .add(debugObject, "leftArchX")
  .min(-2)
  .max(2)
  .step(0.001)
  .name("Left Arch X")
  .onChange(() => {
    archFront.position.x = debugObject.leftArchX;
    archBack.position.x = debugObject.leftArchX;
  });

leftArch.add(archFront, archBack);
leftArch.position.x = -2;

const rightArch = leftArch.clone();
rightArch.position.x = 2;

// Swing group
const swing = new THREE.Group();
swing.position.y = 2;
const leftRopeGeometry = new THREE.CylinderGeometry(1 / 64, 1 / 64, 2.5);
const leftRope = new THREE.Mesh(leftRopeGeometry, ropeMaterial);
leftRope.position.y = -1.3;
leftRope.position.x = -0.5;

const rightRope = leftRope.clone();
rightRope.position.x = 0.5;

gui.add(leftRope.position, "y").min(-2).max(1).step(0.0001).name("RopeLeft Y");

debugObject.ropeX = 0;

gui
  .add(debugObject, "ropeX")
  .min(0)
  .max(2)
  .step(0.0001)
  .name("Rope X")
  .onChange(() => {
    leftRope.position.x = -debugObject.ropeX;
    rightRope.position.x = debugObject.ropeX;
  });

debugObject.swingSeatWidth = 1.5;
debugObject.swingSeatHeight = 0.03;
debugObject.swingSeatDepth = 0.5;
const swingSeatGeometry = new THREE.BoxGeometry(
  debugObject.swingSeatWidth,
  debugObject.swingSeatHeight,
  debugObject.swingSeatDepth
);
const swingSeat = new THREE.Mesh(swingSeatGeometry, swingSeatMaterial);
swingSeat.position.y = -2.538;

const swingSeatGui = gui.addFolder("Swing Seat");

const updateSwingSeatDimensions = () => {
  swingSeat.geometry.dispose();
  swingSeat.geometry = new THREE.BoxGeometry(
    debugObject.swingSeatWidth,
    debugObject.swingSeatHeight,
    debugObject.swingSeatDepth
  );
};

swingSeatGui
  .add(debugObject, "swingSeatWidth")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Width")
  .onChange(updateSwingSeatDimensions);
swingSeatGui
  .add(debugObject, "swingSeatHeight")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Height")
  .onChange(updateSwingSeatDimensions);
swingSeatGui
  .add(debugObject, "swingSeatDepth")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Depth")
  .onChange(updateSwingSeatDimensions);
swingSeatGui.add(swingSeat.position, "y").min(-3).max(1).step(0.001);

swing.add(leftRope, rightRope, swingSeat);
gui
  .add(swing.rotation, "x")
  .min(-Math.PI)
  .max(Math.PI)
  .step(0.001)
  .name("Swing Rotation");

const objects = [topBar, leftArch, rightArch, swing];
scene.add(...objects);

// Environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "./textures/environmentMaps/rosendal_park_sunset_puresky_4k.hdr",
  (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = environmentMap;
    scene.environment = environmentMap;
  }
);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update size
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 2.5;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
//const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animations
  swing.rotation.x = Math.sin(2.5 * elapsedTime) * 0.5;
  camera.position.x = Math.sin(elapsedTime) * 5;
  camera.position.z = Math.cos(elapsedTime) * 5;
  camera.lookAt(0, 0, 0);

  // Update controls
  // controls.update();

  // Render
  renderer.render(scene, camera);

  // Call next tick
  window.requestAnimationFrame(tick);
};

tick();
gui.hide();
