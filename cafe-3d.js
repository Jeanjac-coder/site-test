/*
 * Grains de café en 3D dans le hero : un grain principal et quelques grains
 * qui flottent en profondeur. Ils tournent doucement, suivent la souris et
 * s'envolent au défilement. Le rendu s'arrête quand le hero n'est plus visible.
 * Désactivé si le visiteur préfère moins d'animations ou sans WebGL.
 */
import * as THREE from "./vendor/three.module.min.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

/* Forme du grain : ellipsoïde, face plate creusée d'un sillon en « S » */
function createBeanGeometry(detail) {
  const geo = new THREE.SphereGeometry(1, detail, Math.round(detail * 0.75));
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let { x, y, z } = v;
    x *= 0.74;
    z *= 0.52;
    if (z > 0) {
      z *= 0.6;
      const center = 0.1 * Math.sin(y * 2.6);
      const d = x - center;
      z -= 0.22 * Math.exp(-(d * d) / (2 * 0.05 * 0.05)) * (1 - y * y * 0.85);
    }
    const n = 1 + 0.012 * Math.sin(x * 9 + y * 7) * Math.cos(y * 5 - z * 8);
    p.setXYZ(i, x * n, y * n, z * n);
  }
  geo.computeVertexNormals();
  return geo;
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function init() {
  const host = document.getElementById("hero-beans");
  const hero = document.getElementById("top");
  if (!host || !hero) return;

  const canvas = document.createElement("canvas");
  canvas.className = "cafe-3d";
  host.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.z = 14;

  const hemi = new THREE.HemisphereLight(0xfff3e0, 0x2a1a10, 1.1);
  const key = new THREE.DirectionalLight(0xffe2b8, 2.8);
  key.position.set(5, 6, 8);
  const rim = new THREE.DirectionalLight(0xd6a35a, 2.4);
  rim.position.set(-6, -2, -5);
  scene.add(hemi, key, rim);

  const mat = new THREE.MeshPhysicalMaterial({ color: 0x4a2a18, roughness: 0.42, metalness: 0.02, clearcoat: 0.5, clearcoatRoughness: 0.4, sheen: 0.25, sheenColor: 0x8a5a35 });
  const geoBig = createBeanGeometry(80);
  const geoSmall = createBeanGeometry(36);

  // Grains : position de base (x relatif à la largeur visible, y, profondeur), taille, vitesse
  const mobile = () => window.innerWidth < 700;
  const layout = [
    { x: 0.34, y: 0.26, z: 0, s: 0.72, big: true },
    { x: 0.46, y: 0.06, z: -3, s: 0.3 },
    { x: 0.18, y: 0.40, z: -5, s: 0.24 },
    { x: 0.08, y: 0.16, z: -7, s: 0.22 },
    { x: 0.44, y: 0.44, z: 1.5, s: 0.22 },
    { x: 0.26, y: -0.02, z: -2, s: 0.2 }
  ];
  const beans = layout.map((b, i) => {
    const m = new THREE.Mesh(b.big ? geoBig : geoSmall, mat);
    m.userData = { ...b, phase: i * 1.7, spin: 0.15 + (i % 3) * 0.08, rx: Math.random() * 6, ry: Math.random() * 6 };
    scene.add(m);
    return m;
  });

  let W = 1, H = 1;
  function resize() {
    W = host.clientWidth || window.innerWidth;
    H = host.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const small = mobile();
    beans.forEach((b, i) => (b.visible = !small || i < 4));
  }

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("pointermove", (e) => {
    tmx = e.clientX / window.innerWidth - 0.5;
    tmy = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const follow = 1 - Math.pow(0.02, dt);
    mx = lerp(mx, tmx, follow);
    my = lerp(my, tmy, follow);

    const r = hero.getBoundingClientRect();
    const k = clamp(-r.top / Math.max(1, r.height), 0, 1); // 0 en haut, 1 hero sorti
    const halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const halfW = halfH * camera.aspect;
    const small = mobile();

    beans.forEach((b) => {
      const d = b.userData;
      const depth = 1 + d.z / 10; // les grains proches bougent plus (profondeur)
      const baseX = small ? (d.x * 0.6 + 0.25) * 2 * halfW : d.x * 2 * halfW;
      const baseY = small ? (d.y * 0.7 + 0.3) * 2 * halfH : d.y * 2 * halfH;
      b.position.x = baseX + mx * 1.6 * depth;
      b.position.y = baseY + Math.sin(t * 0.8 + d.phase) * 0.18 - my * 1.2 * depth + k * (6 + d.z * 0.4) * depth;
      b.position.z = d.z;
      const s = d.s * (small ? 0.75 : 1) * halfH * 0.42;
      b.scale.setScalar(s * (1 - k * 0.3));
      b.rotation.x = d.rx + t * d.spin * 0.6 + k * 3 + my * 0.5;
      b.rotation.y = d.ry + t * d.spin + k * 4 * (d.big ? 0.6 : 1) + mx * 0.8;
      b.rotation.z = Math.sin(t * 0.4 + d.phase) * 0.3;
    });
    canvas.style.opacity = String(1 - k * 0.9);
    renderer.render(scene, camera);
  }
  const start = () => { if (!raf) { clock.getDelta(); frame(); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  let inView = true;
  new IntersectionObserver((e) => { inView = e[0].isIntersecting; inView && !document.hidden ? start() : stop(); }).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden || !inView ? stop() : start()));
  reduceMotion.addEventListener("change", () => { if (reduceMotion.matches) { stop(); canvas.hidden = true; } });
  window.addEventListener("resize", resize);

  resize();
  start();
  requestAnimationFrame(() => canvas.classList.add("is-ready"));
}

if (!reduceMotion.matches && supportsWebGL()) {
  const go = () => init();
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 1500 });
  else setTimeout(go, 300);
}
