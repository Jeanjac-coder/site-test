/*
 * Aube Café — effets et bonus : loader, grains qui tombent, ambiance sonore,
 * roue de bienvenue, assistant café, curseur grain.
 * S'appuie sur window.Aube (exposé par script.js).
 */
(function () {
  "use strict";

  const A = window.Aube;
  const cfg = window.SITE_CONFIG;
  if (!A) return;
  const $ = (s, r = document) => r.querySelector(s);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const t = A.t, esc = A.esc;

  // ============================================================
  //  Loader : la machine verse une tasse, puis s'efface
  // ============================================================
  (function loader() {
    const el = $("#loader");
    if (!el || document.documentElement.classList.contains("no-loader")) return;
    const done = () => {
      el.classList.add("is-done");
      try { sessionStorage.setItem("loaded", "1"); } catch (e) {}
      setTimeout(() => el.remove(), 900);
    };
    const t0 = performance.now();
    const finish = () => setTimeout(done, Math.max(0, (reduced ? 200 : 1700) - (performance.now() - t0)));
    if (document.readyState === "complete") finish(); else window.addEventListener("load", finish, { once: true });
    setTimeout(done, 4000); // filet de sécurité
  })();

  // ============================================================
  //  Grains qui tombent avec une physique légère
  //  (au défilement rapide et à chaque ajout au panier)
  // ============================================================
  const fx = (function beans() {
    const canvas = $("#beans-fx");
    if (!canvas || reduced) return { burst() {} };
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    const parts = [];
    let raf = 0;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    function drawBean(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      const g = ctx.createRadialGradient(-p.s * 0.3, -p.s * 0.4, p.s * 0.1, 0, 0, p.s * 1.2);
      g.addColorStop(0, "#8a5a36");
      g.addColorStop(1, "#2e1a0e");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s * 0.72, p.s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,10,4,.75)";
      ctx.lineWidth = Math.max(1, p.s * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, -p.s * 0.8);
      ctx.bezierCurveTo(p.s * 0.28, -p.s * 0.3, -p.s * 0.28, p.s * 0.3, 0, p.s * 0.8);
      ctx.stroke();
      ctx.restore();
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.32;            // gravité
        p.vx *= 0.995;           // frottement de l'air
        p.x += p.vx; p.y += p.vy;
        p.r += p.vr;
        if (p.y > H - p.s && p.vy > 0) { // petit rebond au sol
          p.y = H - p.s;
          p.vy *= -0.42; p.vx *= 0.7; p.vr *= 0.6;
          p.bounces++;
        }
        if (p.bounces > 1) p.life -= 0.03;
        if (p.life <= 0 || p.x < -40 || p.x > W + 40) { parts.splice(i, 1); continue; }
        drawBean(p);
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    }
    function spawn(x, y, n, spread) {
      for (let i = 0; i < n && parts.length < 40; i++) {
        parts.push({
          x: x + (Math.random() - 0.5) * (spread || 40), y,
          vx: (Math.random() - 0.5) * 7, vy: -4 - Math.random() * 6,
          r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
          s: 5 + Math.random() * 5, life: 1, bounces: 0
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    // Défilement rapide : quelques grains tombent du haut
    let lastY = scrollY, lastT = performance.now(), cool = 0;
    addEventListener("scroll", () => {
      const now = performance.now();
      const v = Math.abs(scrollY - lastY) / Math.max(1, now - lastT);
      lastY = scrollY; lastT = now;
      if (v > 2.2 && now > cool) {
        cool = now + 900;
        for (let i = 0; i < 3; i++) setTimeout(() => spawn(Math.random() * W, -20, 1), i * 120);
      }
    }, { passive: true });
    document.addEventListener("aube:add", (e) => {
      const el = e.detail && e.detail.el;
      const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : { left: W / 2, top: H / 2, width: 0 };
      spawn(r.left + r.width / 2, r.top, 9, r.width / 2);
      sound.pour();
    });
    return { burst: spawn };
  })();

  // ============================================================
  //  Ambiance sonore (désactivée par défaut) — sons synthétisés
  // ============================================================
  const sound = (function () {
    let ac = null, on = false, crackleTimer = null, master = null;
    const btn = $("#sound-btn");
    function ensure() {
      if (ac) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.5;
      master.connect(ac.destination);
    }
    // Petit crépitement de torréfaction
    function crack() {
      if (!on || !ac) return;
      const len = 0.03 + Math.random() * 0.04;
      const buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const src = ac.createBufferSource();
      src.buffer = buf;
      const f = ac.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 1800 + Math.random() * 2500; f.Q.value = 1.2;
      const g = ac.createGain();
      g.gain.value = 0.05 + Math.random() * 0.08;
      src.connect(f).connect(g).connect(master);
      src.start();
      crackleTimer = setTimeout(crack, 180 + Math.random() * 900);
    }
    // Bruit de café qui coule (au panier)
    function pour() {
      if (!on || !ac) return;
      const dur = 0.9;
      const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / d.length);
      const src = ac.createBufferSource();
      src.buffer = buf;
      const f = ac.createBiquadFilter();
      f.type = "lowpass"; f.frequency.setValueAtTime(600, ac.currentTime); f.frequency.linearRampToValueAtTime(1400, ac.currentTime + dur);
      const g = ac.createGain();
      g.gain.value = 0.25;
      src.connect(f).connect(g).connect(master);
      src.start();
    }
    function set(v) {
      on = v;
      btn.setAttribute("aria-pressed", String(on));
      btn.innerHTML = `<svg class="ic"><use href="#i-${on ? "sound" : "mute"}"/></svg>`;
      if (on) { ensure(); if (ac && ac.state === "suspended") ac.resume(); clearTimeout(crackleTimer); crack(); }
      else clearTimeout(crackleTimer);
      A.toast(t(on ? "soundOn" : "soundOff"));
    }
    if (btn) btn.addEventListener("click", () => set(!on));
    return { pour };
  })();

  // ============================================================
  //  Roue de bienvenue (une seule fois par visiteur)
  // ============================================================
  (function wheel() {
    const w = cfg.wheel;
    if (!w || !w.enabled || !w.prizes.length) return;
    if (A.store.get("wheelDone", false)) return;
    const colors = ["#0e0b09", "#876632", "#5a3a26", "#efe7dc"];
    const txt = ["#f6f1ea", "#fff", "#f6f1ea", "#0e0b09"];
    const n = w.prizes.length * 2; // chaque lot apparaît deux fois
    const seg = 360 / n;
    function svg() {
      let s = `<svg viewBox="-100 -100 200 200" class="wheel__disc" id="wheel-disc" aria-hidden="true">`;
      for (let i = 0; i < n; i++) {
        const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
        const pr = w.prizes[i % w.prizes.length];
        s += `<path d="M0 0 L${(98 * Math.cos(a0)).toFixed(2)} ${(98 * Math.sin(a0)).toFixed(2)} A98 98 0 0 1 ${(98 * Math.cos(a1)).toFixed(2)} ${(98 * Math.sin(a1)).toFixed(2)} Z" fill="${colors[i % 4]}"/>`;
        const mid = i * seg + seg / 2;
        const words = A.tr(pr.label).split(" ");
        const lines = words.length > 1 && A.tr(pr.label).length > 8 ? [words[0], words.slice(1).join(" ")] : [A.tr(pr.label)];
        s += `<text transform="rotate(${mid - 90}) translate(60 0)" text-anchor="middle" fill="${txt[i % 4]}" font-size="8.5" font-weight="600" font-family="Open Sauce Sans, sans-serif">${lines.map((l, k) => `<tspan x="0" dy="${k ? "1.1em" : lines.length > 1 ? "-.2em" : ".35em"}">${esc(l)}</tspan>`).join("")}</text>`;
      }
      s += `<circle r="16" fill="#fff"/><circle r="6" fill="#b48f52"/></svg>`;
      return s;
    }
    function open() {
      if (document.querySelector("dialog[open]") || document.querySelector(".drawer.is-open, .filters.is-open") || !$("#chat").hidden || !$("#search-sheet").hidden || (document.activeElement && document.activeElement.matches("input, textarea, select"))) { setTimeout(open, 15000); return; }
      $("#wheel-body").innerHTML = A.closeBtn() + `<div class="wheel"><p class="eyebrow">Akwaba</p><h2>${t("wheelT")}</h2><p>${t("wheelP")}</p><div class="wheel__wrap">${svg()}</div><div id="wheel-out"></div><div class="wheel__actions"><button type="button" class="btn btn--dark btn--lg" id="wheel-spin">${t("spin")}</button><button type="button" class="btn btn--line btn--lg" data-dismiss>${t("later")}</button></div></div>`;
      A.showModal("wheel-modal");
      A.store.set("wheelDone", true);
      $("#wheel-spin").addEventListener("click", spin, { once: true });
    }
    function spin() {
      // Tirage pondéré
      const total = w.prizes.reduce((s, p) => s + p.weight, 0);
      let r = Math.random() * total, idx = 0;
      for (; idx < w.prizes.length; idx++) { r -= w.prizes[idx].weight; if (r <= 0) break; }
      idx = Math.min(idx, w.prizes.length - 1);
      const slot = idx + (Math.random() < 0.5 ? 0 : w.prizes.length);
      const target = 360 * 6 - (slot * seg + seg / 2) + (Math.random() - 0.5) * seg * 0.6;
      const disc = $("#wheel-disc");
      const btn = $("#wheel-spin");
      btn.disabled = true;
      disc.style.transform = `rotate(${target}deg)`;
      setTimeout(() => {
        const pr = w.prizes[idx];
        A.applyCode(pr.code);
        $("#wheel-out").innerHTML = `<p class="wheel__result">${esc(t("won", { p: A.tr(pr.label) }))}</p><span class="wheel__code">${esc(pr.code)}</span><p class="small">${esc(t("wonCode", { c: pr.code }))}</p>`;
        btn.outerHTML = `<a href="cafes.html" class="btn btn--dark btn--lg">${t("shop")}</a>`;
        const r2 = disc.getBoundingClientRect();
        fx.burst(r2.left + r2.width / 2, r2.top + r2.height / 2, 14, r2.width / 2);
      }, reduced ? 50 : 4900);
    }
    setTimeout(open, w.delay || 25000);
  })();

  // ============================================================
  //  Assistant café (virtuel) : quiz en 3 questions + relais WhatsApp
  // ============================================================
  (function chat() {
    const box = $("#chat"), body = $("#chat-body"), quick = $("#chat-quick");
    if (!box) return;
    let answers = {};
    let started = false;
    const scroll = () => (body.scrollTop = body.scrollHeight);
    function bot(html, delay) {
      return new Promise((res) => {
        const typing = document.createElement("div");
        typing.className = "typing";
        typing.innerHTML = "<i></i><i></i><i></i>";
        body.appendChild(typing);
        scroll();
        setTimeout(() => {
          typing.remove();
          const p = document.createElement("p");
          p.className = "bubble bubble--bot";
          p.innerHTML = html;
          body.appendChild(p);
          scroll();
          res();
        }, reduced ? 50 : delay || 700);
      });
    }
    function me(text) {
      const p = document.createElement("p");
      p.className = "bubble bubble--me";
      p.textContent = text;
      body.appendChild(p);
      scroll();
    }
    function choices(list) {
      quick.innerHTML = list.map(([k, label]) => `<button type="button" class="chip" data-c="${k}">${esc(label)}</button>`).join("");
    }
    async function hello() {
      body.innerHTML = "";
      answers = {};
      await bot(esc(t("botHello")));
      choices([["go", t("botGo")], ["human", t("botHuman")], ["track", t("botTrack")]]);
    }
    async function q1() { await bot(esc(t("botQ1"))); choices([["a", t("q1a")], ["b", t("q1b")], ["c", t("q1c")], ["d", t("q1d")]].map(([k, l]) => ["q1" + k, l])); }
    async function q2() { await bot(esc(t("botQ2"))); choices([["a", t("q2a")], ["b", t("q2b")], ["c", t("q2c")], ["d", t("q2d")]].map(([k, l]) => ["q2" + k, l])); }
    async function q3() { await bot(esc(t("botQ3"))); choices([["a", t("q3a")], ["b", t("q3b")], ["c", t("q3c")]].map(([k, l]) => ["q3" + k, l])); }
    function pick() {
      const want = {
        q1a: { m: "espresso", tags: ["intense"] }, q1b: { tags: ["lait"] }, q1c: { m: "filtre", tags: [] }, q1d: { tags: [] },
        q2a: { tags: ["chocolat", "caramel"] }, q2b: { tags: ["fruite", "floral"] }, q2c: { tags: ["epices", "intense"] }, q2d: { tags: ["caramel", "doux"] },
        q3a: { int: 5 }, q3b: { int: 2 }, q3c: { tags: ["rare"] }
      };
      const prefs = [want[answers.q1], want[answers.q2], want[answers.q3]].filter(Boolean);
      return cfg.products
        .filter((p) => p.stock > 0)
        .map((p) => {
          let s = 0;
          prefs.forEach((w) => {
            (w.tags || []).forEach((tg) => { if (p.tags.includes(tg)) s += 2; });
            if (w.m && p.methods.includes(w.m)) s += 2;
            if (w.int) s -= Math.abs(p.intensity - w.int);
          });
          return { p, s };
        })
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p);
    }
    async function result() {
      quick.innerHTML = "";
      const list = pick();
      const p = list[0];
      const grind = answers.q1 === "q1a" ? "Espresso" : answers.q1 === "q1c" ? "Filtre" : p.methods.includes("espresso") ? "Espresso" : "Filtre";
      await bot(esc(t("botResult", { p: p.name, n: A.tr(p.notes), g: grind })), 1100);
      const card = document.createElement("div");
      card.className = "chat__product";
      card.innerHTML = `<img src="${p.image}" alt="" width="64" height="64"><div><strong>${esc(p.name)}</strong><span class="price small">${A.money(A.priceOf(p))}</span><div class="chips"><button type="button" class="chip" data-see="${p.id}">${t("botSee")}</button><button type="button" class="chip is-on" data-buy="${p.id}" data-g="${grind}">${t("addCart")}</button></div></div>`;
      body.appendChild(card);
      scroll();
      await bot(esc(t("botAlso", { a: list.slice(1, 3).map((x) => x.name).join(", ") })), 600);
      choices([["again", t("botAgain")], ["human", t("botHuman")]]);
    }
    async function human(track) {
      quick.innerHTML = "";
      await bot(esc(t(track ? "botTrackMsg" : "botHumanMsg")));
      const msg = A.lang() === "en" ? (track ? "Hello, I'd like to track my order. My name: " : "Hello Aube Café, I have a question: ") : (track ? "Bonjour, je souhaite suivre ma commande. Mon nom : " : "Bonjour Aube Café, j'ai une question : ");
      await bot(`<a class="btn btn--wa btn--sm" href="${A.waLink(msg)}" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg> ${t("openWa")}</a>`, 400);
      choices([["again", t("botAgain")]]);
    }
    quick.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-c]");
      if (!b) return;
      const c = b.dataset.c;
      me(b.textContent);
      quick.innerHTML = "";
      if (c === "go" || c === "again") { answers = {}; return q1(); }
      if (c === "human") return human(false);
      if (c === "track") return human(true);
      if (c.startsWith("q1")) { answers.q1 = c; return q2(); }
      if (c.startsWith("q2")) { answers.q2 = c; return q3(); }
      if (c.startsWith("q3")) { answers.q3 = c; return result(); }
    });
    body.addEventListener("click", (e) => {
      const s = e.target.closest("[data-see]");
      if (s) A.openProduct(s.dataset.see);
      const b = e.target.closest("[data-buy]");
      if (b) { A.addToCart(b.dataset.buy, b.dataset.g, 1, b); }
    });
    function open() {
      box.hidden = false;
      $("#fab").setAttribute("aria-expanded", "true");
      if (!started) { started = true; hello(); }
      setTimeout(() => { const f = quick.querySelector("button") || $("#chat-close"); if (f) f.focus({ preventScroll: true }); }, 900);
    }
    function close() { box.hidden = true; $("#fab").setAttribute("aria-expanded", "false"); }
    document.addEventListener("click", (e) => {
      if (e.target.closest(".js-open-chat")) { if (e.target.closest("#fab") && !box.hidden) close(); else open(); }
    });
    $("#chat-close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
    document.addEventListener("aube:lang", () => { if (started) hello(); });
  })();

  // ============================================================
  //  Curseur grain de café (souris uniquement)
  // ============================================================
  (function cursor() {
    const c = $("#cursor");
    if (!c || !fine || reduced) return;
    let x = -50, y = -50, cx = -50, cy = -50, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.25; cy += (y - cy) * 0.25;
      c.style.transform = `translate3d(${cx + 10}px, ${cy + 12}px, 0) rotate(${(x - cx) * 2}deg)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      c.classList.add("is-on");
      c.classList.toggle("is-hover", !!e.target.closest("a, button, [data-open], label, select"));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener("mouseleave", () => c.classList.remove("is-on"));
  })();

  // ============================================================
  //  PWA : service worker
  // ============================================================
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
