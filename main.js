// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000033);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 30, 70);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 1, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Create Sun
const sunGeo = new THREE.SphereGeometry(5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  emissive: 0xffff00,
  emissiveIntensity: 0.5,
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planet data
const planets = [
  { name: "Mercury", radius: 0.4, distance: 10, color: 0xaaaaaa, speed: 0.04 },
  { name: "Venus", radius: 0.6, distance: 15, color: 0xe6c229, speed: 0.015 },
  { name: "Earth", radius: 0.6, distance: 20, color: 0x6b93d6, speed: 0.01 },
  { name: "Mars", radius: 0.5, distance: 25, color: 0x993d00, speed: 0.008 },
  { name: "Jupiter", radius: 1.2, distance: 35, color: 0xe3dccb, speed: 0.004 },
  {
    name: "Saturn",
    radius: 1.0,
    distance: 45,
    color: 0xf5e4b7,
    speed: 0.0015,
    hasRings: true,
  },
  { name: "Uranus", radius: 0.8, distance: 55, color: 0xc1e3e3, speed: 0.001 },
  {
    name: "Neptune",
    radius: 0.8,
    distance: 65,
    color: 0x5b5ddf,
    speed: 0.0006,
  },
];

const planetMeshes = [];

// Create planets
planets.forEach((planet) => {
  const geo = new THREE.SphereGeometry(planet.radius, 32, 32);
  const mat = new THREE.MeshPhongMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.x = planet.distance;
  mesh.userData = { ...planet, angle: Math.random() * Math.PI * 2 };

  // Add rings to Saturn
  if (planet.hasRings) {
    const ringGeo = new THREE.RingGeometry(1.1, 1.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe3dccb,
      side: THREE.DoubleSide,
    });
    const rings = new THREE.Mesh(ringGeo, ringMat);
    rings.rotation.x = Math.PI / 2;
    mesh.add(rings);
  }

  scene.add(mesh);
  planetMeshes.push(mesh);

  // Add orbit path
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        planet.distance * Math.cos(angle),
        0,
        planet.distance * Math.sin(angle)
      )
    );
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
  const orbitMat = new THREE.LineBasicMaterial({ color: 0x555555 });
  const orbit = new THREE.Line(orbitGeo, orbitMat);
  scene.add(orbit);
});

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add speed controls
const controlsDiv = document.getElementById("controls");
planetMeshes.forEach((planet, i) => {
  const div = document.createElement("div");
  div.className = "planet-control";

  const label = document.createElement("label");
  label.textContent = planet.userData.name;
  label.htmlFor = `speed-${i}`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = `speed-${i}`;
  slider.min = "0";
  slider.max = "0.1";
  slider.step = "0.001";
  slider.value = planet.userData.speed;

  slider.addEventListener("input", () => {
    planet.userData.speed = parseFloat(slider.value);
  });

  div.appendChild(label);
  div.appendChild(slider);
  controlsDiv.appendChild(div);
});

// Pause button
let isPaused = false;
document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused
    ? "Resume"
    : "Pause";
});

// Animation
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planetMeshes.forEach((planet) => {
      planet.userData.angle += planet.userData.speed * 0.1;
      planet.position.x =
        planet.userData.distance * Math.cos(planet.userData.angle);
      planet.position.z =
        planet.userData.distance * Math.sin(planet.userData.angle);
      planet.rotation.y += 0.01;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
