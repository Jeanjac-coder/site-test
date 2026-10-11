/*
 * Un grain de café en 3D qui accompagne le défilement.
 * - Dans le haut de page, il trône en grand au centre du disque.
 * - En descendant, il rétrécit et se pose dans la marge, en changeant de côté
 *   à chaque section, tout en tournant sur lui-même.
 * Désactivé si le visiteur a demandé moins d'animations ou si l'appareil ne
 * gère pas la 3D (WebGL) : une image fixe du grain s'affiche alors.
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
function createBeanGeometry() {
  const geo = new THREE.SphereGeometry(1, 96, 72);
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
    // très légères irrégularités, comme un vrai grain torréfié
    const n = 1 + 0.012 * Math.sin(x * 9 + y * 7) * Math.cos(y * 5 - z * 8);
    p.setXYZ(i, x * n, y * n, z * n);
  }
  geo.computeVertexNormals();
  return geo;
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function init() {
  const stage = document.getElementById("bean-stage");
  if (!stage) return;
  const canvas = document.createElement("canvas");
  canvas.className = "cafe-3d";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 12;

  const hemi = new THREE.HemisphereLight(0xfff3e0, 0x3a2416, 1.2);
  const key = new THREE.DirectionalLight(0xffe2b8, 2.6);
  key.position.set(4, 6, 8);
  const rim = new THREE.DirectionalLight(0xe0a85a, 2.2);
  rim.position.set(-6, -3, -4);
  const fill = new THREE.PointLight(0xffffff, 0.6);
  fill.position.set(-3, 2, 6);
  scene.add(hemi, key, rim, fill);

  const bean = new THREE.Mesh(
    createBeanGeometry(),
    new THREE.MeshPhysicalMaterial({ color: 0x5a3420, roughness: 0.4, metalness: 0.02, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.3, sheenColor: 0x8a5a35 })
  );
  scene.add(bean);

  document.addEventListener("themechange", (e) => {
    const dark = e.detail.dark;
    hemi.intensity = dark ? 1.8 : 1.2;
    key.intensity = dark ? 3.2 : 2.6;
  });
  const darkNow = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (darkNow) {
    hemi.intensity = 1.8;
    key.intensity = 3.2;
  }

  let W = 0, H = 0;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  // unités 3D par pixel au plan z = 0
  const unitsPerPx = () => (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / H;

  // Position du grain à l'écran (pixels) et taille (hauteur en pixels)
  const cur = { x: 0, y: 0, s: 0, ready: false };
  let spin = 0;
  let lastSide = 1;
  let mouseX = 0, mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX / W - 0.5;
    mouseY = e.clientY / H - 0.5;
  }, { passive: true });

  const sections = Array.from(document.querySelectorAll("main > section"));
  function sideFor() {
    const mid = H / 2;
    const i = sections.findIndex((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    return i < 0 ? lastSide : i % 2 ? -1 : 1;
  }

  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const r = stage.getBoundingClientRect();

    // 1. Cible dans le haut de page : au centre du disque
    const heroX = r.left + r.width / 2;
    const heroY = r.top + r.height * 0.47;
    const heroS = r.width * 0.46;

    // 2. Cible « posée » dans la marge
    const gutter = Math.max(0, (W - 1240) / 2 + 20);
    const mobile = W < 720;
    const side = sideFor();
    if (side !== lastSide) spin += Math.PI * 2 * side; // tour complet en changeant de côté
    lastSide = side;
    const dockS = mobile ? 46 : clamp(gutter * 0.85, 70, 150);
    const inset = mobile ? 6 : Math.max(dockS * 0.42, gutter / 2);
    const dockX = side > 0 ? W - inset : inset;
    const dockY = H * 0.62;

    // Progression entre les deux selon le défilement
    // 0 tant que le centre du disque est dans la moitié basse de l'écran,
    // 1 quand il atteint le haut : le grain quitte le disque quand on le dépasse
    const k = ease(clamp(1 - (r.top + r.height * 0.5) / (H * 0.45), 0, 1));
    const tx = lerp(heroX, dockX, k);
    const ty = lerp(heroY, dockY, k) + Math.sin(t * 1.4) * (lerp(10, 6, k));
    const ts = lerp(heroS, dockS, k);
    if (!cur.ready) Object.assign(cur, { x: tx, y: ty, s: ts, ready: true });
    const follow = 1 - Math.pow(0.0008, dt); // lissage indépendant de la fréquence d'images
    cur.x = lerp(cur.x, tx, follow);
    cur.y = lerp(cur.y, ty, follow);
    cur.s = lerp(cur.s, ts, follow);

    const u = unitsPerPx();
    bean.position.set((cur.x - W / 2) * u, -(cur.y - H / 2) * u, 0);
    bean.scale.setScalar((cur.s / 2) * u);

    // Rotation : liée au défilement, plus un léger mouvement permanent
    const scroll = window.scrollY;
    const targetRotY = scroll * 0.0045 + spin + t * 0.25 + mouseX * (1 - k) * 0.8;
    bean.rotation.y = lerp(bean.rotation.y, targetRotY, 1 - Math.pow(0.002, dt));
    bean.rotation.x = Math.sin(t * 0.7) * 0.25 + scroll * 0.0012 + mouseY * (1 - k) * 0.6;
    bean.rotation.z = -0.35 + Math.sin(t * 0.5) * 0.12 + Math.sin(scroll * 0.002) * 0.35;

    renderer.render(scene, camera);
  }
  const start = () => {
    if (!raf) {
      clock.getDelta();
      frame();
    }
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      stop();
      canvas.hidden = true;
      document.documentElement.classList.remove("has-3d");
    }
  });

  resize();
  start();
  requestAnimationFrame(() => {
    canvas.classList.add("is-ready");
    document.documentElement.classList.add("has-3d");
  });
}

if (!reduceMotion.matches && supportsWebGL()) {
  const go = () => init();
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 1500 });
  else setTimeout(go, 200);
}
