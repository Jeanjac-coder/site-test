/*
 * Grains de café en 3D qui descendent quand on fait défiler la page.
 * Chargé après l'affichage de la page pour ne pas la ralentir.
 * Désactivé si le visiteur a demandé moins d'animations ou si son
 * appareil ne gère pas la 3D (WebGL) : le site reste alors identique.
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

/* ---------- Forme d'un grain de café ----------
   Un ellipsoïde dont une face est aplatie et creusée d'un sillon en « S ». */
function createBeanGeometry() {
  const geo = new THREE.SphereGeometry(1, 64, 48);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let { x, y, z } = v;
    x *= 0.72;
    z *= 0.5;
    if (z > 0) {
      z *= 0.62; // face plate
      const center = 0.09 * Math.sin(y * 2.6); // sillon en S
      const d = x - center;
      const groove = 0.2 * Math.exp(-(d * d) / (2 * 0.055 * 0.055)) * (1 - y * y * 0.85);
      z -= groove;
    }
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function init() {
  const canvas = document.createElement("canvas");
  canvas.className = "cafe-3d";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.z = 14;

  // Éclairage chaud, comme une lumière de matin
  const hemi = new THREE.HemisphereLight(0xfff3e0, 0x3a2416, 1.1);
  const key = new THREE.DirectionalLight(0xffd9a8, 2.4);
  key.position.set(4, 6, 8);
  const rim = new THREE.DirectionalLight(0xe0a85a, 1.6);
  rim.position.set(-6, -2, -4);
  scene.add(hemi, key, rim);

  const geometry = createBeanGeometry();
  const roasts = [0x4a2a17, 0x5c3520, 0x6b3f24, 0x3d2314];
  const materials = roasts.map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.05 })
  );

  // Hauteur visible (en unités 3D) à une profondeur donnée
  const visibleHeight = (z) => 2 * (camera.position.z - z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  // Largeur de la marge à gauche/droite du contenu (conteneur de 1140 px + 16 px)
  const gutter = () => Math.max(16, (window.innerWidth - 1140) / 2 + 16);

  let beans = [];
  function createBeans() {
    beans.forEach((b) => scene.remove(b.mesh));
    beans = [];
    const mobile = window.innerWidth < 720;
    const count = mobile ? 7 : 14;
    for (let i = 0; i < count; i++) {
      const z = rand(-7, 3); // profondeur : les grains proches défilent plus vite
      const h = visibleHeight(z);
      const w = h * camera.aspect;
      // Grains placés dans les marges, de part et d'autre du contenu
      // (un fondu CSS les efface aussi s'ils approchent du texte)
      const side = i % 2 ? 1 : -1;
      // Distance au bord de l'écran, en pixels (sur mobile, les grains dépassent juste du bord)
      const fromEdge = mobile ? rand(-28, 8) : rand(-18, gutter() + 12);
      const x = side * (w / 2) * (1 - (2 * fromEdge) / window.innerWidth);
      const scale = rand(0.32, 0.55) * (mobile ? 0.7 : 1);
      const mesh = new THREE.Mesh(geometry, materials[i % materials.length]);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      beans.push({
        mesh,
        x,
        z,
        span: h * 1.5, // les grains réapparaissent en haut après être sortis en bas
        offset: Math.random(),
        speed: 0.7 + (z + 7) / 10, // effet de profondeur (parallaxe)
        rot: new THREE.Euler(rand(0, 6.3), rand(0, 6.3), rand(0, 6.3)),
        spin: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-0.5, 0.5)),
        sway: rand(0.15, 0.35),
        phase: rand(0, 6.3)
      });
    }
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    if (w < 720) canvas.style.removeProperty("--g"); // valeur mobile définie dans styles.css
    else canvas.style.setProperty("--g", gutter() + "px");
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    createBeans();
  }

  // Défilement lissé pour un mouvement fluide
  let target = window.scrollY;
  let current = target;
  window.addEventListener("scroll", () => (target = window.scrollY), { passive: true });

  const clock = new THREE.Clock();
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    current += (target - current) * 0.08;
    const vh = window.innerHeight;
    // 1 écran défilé = les grains descendent d'environ une hauteur visible
    const progress = current / vh;

    for (const b of beans) {
      const fall = progress * b.speed * (b.span / 1.5) + b.offset * b.span;
      const y = b.span / 2 - (((fall % b.span) + b.span) % b.span);
      b.mesh.position.set(b.x + Math.sin(t * 0.6 + b.phase) * b.sway, y, b.z);
      b.mesh.rotation.set(
        b.rot.x + progress * 2.2 * b.spin.x + t * 0.15 * b.spin.x,
        b.rot.y + progress * 2.6 * b.spin.y + t * 0.2,
        b.rot.z + progress * 1.4 * b.spin.z
      );
    }
    renderer.render(scene, camera);
  }

  function start() {
    if (!raf) {
      clock.start();
      frame();
    }
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      stop();
      canvas.hidden = true;
    } else {
      canvas.hidden = false;
      start();
    }
  });

  resize();
  start();
  requestAnimationFrame(() => canvas.classList.add("is-ready"));
}

if (!reduceMotion.matches && supportsWebGL()) {
  const go = () => init();
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 2000 });
  else setTimeout(go, 300);
}
