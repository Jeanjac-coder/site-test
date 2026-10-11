/*
 * Aube Café — logique de la boutique (panier, filtres, recherche, favoris, comparaison…).
 * Les données viennent de config.js (window.SITE_CONFIG) et les textes de i18n.js (window.I18N).
 */
(function () {
  "use strict";

  const cfg = window.SITE_CONFIG;
  const I = window.I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const has = (s) => !!document.querySelector(s);
  const page = document.body.dataset.page || "accueil";
  const SHOP = "cafes.html";

  // ---------- Stockage local (protégé : navigation privée, stockage bloqué…) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("aube." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("aube." + k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- Langue ----------
  let lang = root.lang === "en" ? "en" : "fr";
  const L = () => (lang === "en" ? 1 : 0);
  const t = (key, vars) => {
    const e = I.dyn[key];
    let s = e ? e[L()] : key;
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  };
  const tr = (o) => (o == null ? "" : Array.isArray(o) ? o[L()] : typeof o === "object" ? o[lang] || o.fr : o);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Le français est écrit dans le HTML : on le mémorise pour pouvoir y revenir.
  const frText = new Map();
  const frAttr = new Map();
  function applyLang() {
    root.lang = lang;
    $$("[data-i18n]").forEach((el) => {
      const k = el.dataset.i18n;
      if (!frText.has(el)) frText.set(el, el.innerHTML);
      el.innerHTML = lang === "en" && I.en[k] ? I.en[k] : frText.get(el);
    });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, k] = pair.split(":");
        const id = attr;
        if (!frAttr.has(el)) frAttr.set(el, {});
        const saved = frAttr.get(el);
        if (!(id in saved)) saved[id] = el.getAttribute(attr) || "";
        el.setAttribute(attr, lang === "en" && I.en[k] ? I.en[k] : saved[id]);
      });
    });
    $("#lang-btn").textContent = lang === "en" ? "FR" : "EN";
    $("#lang-btn").setAttribute("aria-label", lang === "en" ? "Passer en français" : "Switch to English");
  }

  // ---------- Formats ----------
  const money = (n) => new Intl.NumberFormat(lang === "en" ? "en-GB" : cfg.locale, { maximumFractionDigits: 0 }).format(n) + " F CFA";
  const byId = (id) => cfg.products.find((p) => p.id === id);
  const country = (p) => (lang === "en" ? p.country_en : p.country);
  const offerActive = () => cfg.offer && Date.now() < new Date(cfg.offer.endsAt).getTime();
  const isPromo = (p) => offerActive() && cfg.offer.productId === p.id;
  const priceOf = (p) => (isPromo(p) ? Math.round((p.price * (1 - cfg.offer.discount)) / 50) * 50 : p.price);
  const imgs = (p) => [p.image].concat(p.gallery || []);
  const waLink = (text) => "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(text);

  // Code pays (affiché en grand sur les cartes « Origines »)
  const CODES = { ethiopie: "ET", colombie: "CO", bresil: "BR", guatemala: "GT", kenya: "KE", "costa-rica": "CR", jamaique: "JM", vietnam: "VN", perou: "PE", sumatra: "ID", "robusta-ci": "CI", rwanda: "RW", panama: "PA", inde: "IN", maison: "CI" };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 2800);
  }
  const bump = (el) => { el.classList.remove("is-pop"); void el.offsetWidth; el.classList.add("is-pop"); };

  // ============================================================
  //  États
  // ============================================================
  let cart = store.get("cart", []);         // [{id, grind, qty}]
  let wish = store.get("wish", []);         // [id]
  let compare = [];                         // [id]
  let recent = store.get("recent", []);     // [id]
  let history = store.get("history", []);   // [query]
  let account = store.get("account", { orders: [], code: null, seen: [] });
  let appliedCode = store.get("code", null);
  const filters = { continent: [], roast: [], intensity: [], method: [], notes: [], price: 0, stock: false, promo: false };
  let sort = "smart";
  const maxPrice = Math.max(...cfg.products.map((p) => p.price));
  filters.price = maxPrice;

  // ============================================================
  //  Images du logo selon le thème
  // ============================================================
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncLogo() {
    $$('img[data-img="logo"]').forEach((img) => (img.src = isDark() && cfg.images.logoSombre ? cfg.images.logoSombre : cfg.images.logo));
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", isDark() ? "#0e0b09" : "#ffffff"));
  }

  // ============================================================
  //  Bandeau promo + compte à rebours de l'offre
  // ============================================================
  let promoIdx = 0;
  function renderPromo() {
    const track = $("#promo-track");
    track.innerHTML = cfg.announcements.map((a, i) => `<p class="promo__msg${i === promoIdx ? " is-on" : ""}">${esc(tr(a))}</p>`).join("");
  }
  function rotatePromo() {
    const msgs = $$(".promo__msg");
    if (msgs.length < 2) return;
    msgs[promoIdx].classList.replace("is-on", "is-off");
    const prev = msgs[promoIdx];
    setTimeout(() => prev.classList.remove("is-off"), 800);
    promoIdx = (promoIdx + 1) % msgs.length;
    msgs[promoIdx].classList.add("is-on");
  }
  function countdown() {
    if (!offerActive()) return "";
    let s = Math.max(0, Math.floor((new Date(cfg.offer.endsAt) - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    const pad = (n) => String(n).padStart(2, "0");
    return (d ? d + (lang === "en" ? "d " : "j ") : "") + pad(h) + ":" + pad(m) + ":" + pad(s);
  }
  function tickOffer() {
    const deal = $("#promo-deal");
    const card = $("#hero-deal");
    if (!offerActive()) { deal.hidden = true; if (card) card.hidden = true; return; }
    const c = countdown();
    deal.hidden = false;
    deal.innerHTML = `<i></i>${esc(tr(cfg.offer.title))} · ${c}`;
    const time = card && card.querySelector("time");
    if (time) time.textContent = (lang === "en" ? "Ends in " : "Se termine dans ") + c;
  }

  // ============================================================
  //  Navbar : masquage au défilement, mega menu, notifications
  // ============================================================
  function initNav() {
    const nav = $("#nav");
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle("is-scrolled", y > 10);
        if (y > lastY + 4 && y > 500 && $("#mega").hidden) { nav.classList.add("is-hidden"); document.body.classList.add("nav-hidden"); }
        else if (y < lastY - 4 || y < 300) { nav.classList.remove("is-hidden"); document.body.classList.remove("nav-hidden"); }
        lastY = y;
        ticking = false;
      });
    }, { passive: true });

    // Lien actif : la page en cours
    $$("[data-nav]").forEach((a) => {
      const on = a.dataset.nav === page;
      a.classList.toggle("is-active", on);
      if (on && a.tagName === "A") a.setAttribute("aria-current", "page");
    });

    // Mega menu
    const btn = $("#mega-btn"), mega = $("#mega");
    const setMega = (open) => { mega.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => setMega(mega.hidden));
    let leaveTimer;
    const fine = window.matchMedia("(hover: hover)").matches;
    if (fine) {
      btn.addEventListener("mouseenter", () => { clearTimeout(leaveTimer); setMega(true); });
      [btn, mega].forEach((el) => el.addEventListener("mouseleave", () => { leaveTimer = setTimeout(() => setMega(false), 220); }));
      mega.addEventListener("mouseenter", () => clearTimeout(leaveTimer));
    }
    mega.addEventListener("click", (e) => {
      const f = e.target.closest("[data-filter]");
      if (f) { applyQuickFilter(f.dataset.filter, f.dataset.value); setMega(false); }
      const p = e.target.closest("[data-product]");
      if (p) { openProduct(p.dataset.product); setMega(false); }
    });
    document.addEventListener("click", (e) => {
      if (!mega.hidden && !e.target.closest("#mega, #mega-btn")) setMega(false);
      if (!$("#notif-panel").hidden && !e.target.closest(".notif")) toggleNotif(false);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMega(false); toggleNotif(false); } });

    // Notifications
    $("#notif-btn").addEventListener("click", () => toggleNotif($("#notif-panel").hidden));
    $("#notif-read").addEventListener("click", () => {
      account.seen = cfg.notifications.map((n) => n.id);
      store.set("account", account);
      renderNotifs();
    });
  }
  function toggleNotif(open) {
    $("#notif-panel").hidden = !open;
    $("#notif-btn").setAttribute("aria-expanded", String(open));
  }
  function renderNotifs() {
    const seen = account.seen || [];
    const list = cfg.notifications;
    $("#notif-list").innerHTML = list.length
      ? list.map((n) => { const [a, b] = n[lang] || n.fr; return `<li class="${seen.includes(n.id) ? "" : "is-new"}"><strong>${esc(a)}</strong><span>${esc(b)}</span></li>`; }).join("")
      : `<li>${t("notifEmpty")}</li>`;
    const unread = list.filter((n) => !seen.includes(n.id)).length;
    const c = $("#notif-count");
    c.hidden = !unread;
    c.textContent = unread;
  }

  function renderMega() {
    const g = (title, items) => `<div><h4>${esc(title)}</h4><ul>${items.join("")}</ul></div>`;
    const link = (type, value, label, n) => `<li><button type="button" class="mega__link" data-filter="${type}" data-value="${value}">${esc(label)}${n != null ? `<small>${n}</small>` : ""}</button></li>`;
    const count = (fn) => cfg.products.filter(fn).length;
    const feat = byId(cfg.offer && offerActive() ? cfg.offer.productId : "maison") || cfg.products[0];
    $("#mega-grid").innerHTML =
      g(t("f_continent"), ["afrique", "ameriques", "asie"].map((c) => link("continent", c, t(c), count((p) => p.continent === c)))) +
      g(t("f_roast"), ["light", "medium", "medium-dark", "dark"].map((r) => link("roast", r, t(r), count((p) => p.roast === r)))) +
      g(t("f_method"), ["espresso", "filtre", "piston", "moka", "cafetiere"].map((m) => link("method", m, t(m), count((p) => p.methods.includes(m))))) +
      g(t("f_notes"), ["chocolat", "caramel", "fruite", "floral", "epices"].map((n) => link("notes", n, t(n), count((p) => p.tags.includes(n))))) +
      `<button type="button" class="mega__feature" data-product="${feat.id}"><img src="${feat.image}" alt="" loading="lazy" width="120" height="120"><span><small>${isPromo(feat) ? t("promo") : t("best")}</small><strong>${esc(feat.name)}</strong><span class="price">${money(priceOf(feat))}${isPromo(feat) ? `<s>${money(feat.price)}</s>` : ""}</span></span></button>`;
    $("#menu-cats").innerHTML = ["afrique", "ameriques", "asie", "espresso", "filtre", "doux", "intense"].map((v) => {
      const type = ["afrique", "ameriques", "asie"].includes(v) ? "continent" : ["espresso", "filtre"].includes(v) ? "method" : "intensity";
      return `<button type="button" class="chip" data-filter="${type}" data-value="${v}">${esc(t(v))}</button>`;
    }).join("");
  }

  // ============================================================
  //  Tiroirs, menu mobile, modales
  // ============================================================
  let openDrawer = null;
  let lastFocus = null;
  function showDrawer(id) {
    closeDrawer(true);
    const d = $("#" + id);
    lastFocus = document.activeElement;
    d.classList.add("is-open");
    $("#scrim").hidden = false;
    document.body.classList.add("is-locked");
    openDrawer = d;
    const ctrl = $(`[aria-controls="${id}"]`);
    if (ctrl) ctrl.setAttribute("aria-expanded", "true");
    if (id === "account") renderAccount();
    setTimeout(() => { const f = d.querySelector("[data-close], button, a, input"); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeDrawer(silent) {
    if (!openDrawer) return;
    const ctrl = $(`[aria-controls="${openDrawer.id}"]`);
    if (ctrl) ctrl.setAttribute("aria-expanded", "false");
    openDrawer.classList.remove("is-open");
    openDrawer = null;
    $("#scrim").hidden = true;
    document.body.classList.remove("is-locked");
    if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function initDrawers() {
    $("#burger").addEventListener("click", () => showDrawer("menu"));
    $("#cart-btn").addEventListener("click", () => showDrawer("cart"));
    $("#wish-btn").addEventListener("click", () => showDrawer("wishlist"));
    $("#account-btn").addEventListener("click", () => showDrawer("account"));
    $("#scrim").addEventListener("click", () => closeDrawer());
    document.addEventListener("click", (e) => {
      const c = e.target.closest("[data-close]");
      if (c && c.closest(".drawer")) closeDrawer(c.tagName === "A");
      const px = e.target.closest("[data-proxy]");
      if (px) { const target = px.dataset.proxy; closeDrawer(true); setTimeout(() => $("#" + target).click(), target === "theme-btn" || target === "sound-btn" ? 0 : 320); }
      const mf = e.target.closest("#menu [data-filter]");
      if (mf) { closeDrawer(true); applyQuickFilter(mf.dataset.filter, mf.dataset.value); }
      if (e.target.closest("#menu .menu > a")) closeDrawer(true);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openDrawer) closeDrawer(); });
    // Les modales <dialog> se ferment au clic sur le fond
    $$("dialog.modal").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));
    $$("dialog.modal").forEach((d) => d.addEventListener("close", () => document.body.classList.remove("is-locked")));
  }
  function showModal(id) {
    const d = $("#" + id);
    if (d.open) return;
    if (openDrawer) closeDrawer(true);
    d.showModal();
    document.body.classList.add("is-locked");
    d.querySelector(".modal__inner").scrollTop = 0;
  }
  const closeBtn = () => `<button type="button" class="icon-btn modal__close" data-dismiss aria-label="${lang === "en" ? "Close" : "Fermer"}"><svg class="ic"><use href="#i-close"/></svg></button>`;
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-dismiss]"); if (b) b.closest("dialog").close(); });

  // ============================================================
  //  Hero : diaporama
  // ============================================================
  let slide = 0, slideTimer = null, paused = false;
  function renderHero() {
    if (!has("#hero-media")) return;
    const media = $("#hero-media"), copy = $("#hero-copy"), bars = $("#hero-bars");
    if (!media.children.length) {
      media.innerHTML = cfg.slides.map((s, i) => `<div class="hero__slide${i === 0 ? " is-active" : ""}"><picture><source media="(max-width: 699px)" srcset="${s.image}-sm.webp" type="image/webp"><img src="${s.image}.webp" alt="" width="1920" height="1080" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></picture></div>`).join("");
    }
    const split = (str) => str.split(" ").map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
    copy.innerHTML = cfg.slides.map((s, i) => {
      const H = i === 0 ? "h1" : "h2";
      return `<div class="hero__text${i === slide ? " is-active" : ""}" aria-hidden="${i !== slide}">
        <p class="hero__eyebrow">${esc(tr(s.eyebrow))}</p>
        <${H} aria-label="${esc(tr(s.title))}">${split(tr(s.title))}</${H}>
        <p>${esc(tr(s.text))}</p>
        <div class="hero__actions"><a href="${s.href}" class="btn btn--light btn--lg" ${i !== slide ? 'tabindex="-1"' : ""}>${esc(tr(s.cta))} <svg class="ic"><use href="#i-right"/></svg></a>
        <a href="${SHOP}" class="btn btn--ghost-light btn--lg" ${i !== slide ? 'tabindex="-1"' : ""}>${lang === "en" ? "Shop now" : "Acheter"}</a></div>
      </div>`;
    }).join("");
    bars.innerHTML = cfg.slides.map((s, i) => `<button type="button" class="hero__bar" role="tab" aria-selected="${i === slide}" aria-label="${i + 1} / ${cfg.slides.length}" style="--delay:${cfg.slideDelay}ms"></button>`).join("");
    $("#slide-t").textContent = String(cfg.slides.length).padStart(2, "0");
    $("#slide-n").textContent = String(slide + 1).padStart(2, "0");
    $(".hero").classList.toggle("is-light", slide === 1);

    // Populaires
    const pop = [["Éthiopie", "Ethiopia"], ["chocolat", "chocolate"], ["doux", "mild"], ["espresso", "espresso"], ["Robusta", "Robusta"]];
    $("#hero-popular").innerHTML = pop.map((q) => `<button type="button" class="chip" data-q="${esc(q[0])}">${esc(q[L()])}</button>`).join("");

    // Offre + produits à la une
    const deal = $("#hero-deal");
    if (offerActive()) {
      const p = byId(cfg.offer.productId);
      deal.hidden = false;
      deal.dataset.product = p.id;
      deal.innerHTML = `<img src="${p.image}" alt="" width="76" height="76"><span><small>${lang === "en" ? "Deal of the moment" : "Offre du moment"} · −${Math.round(cfg.offer.discount * 100)} %</small><strong>${esc(p.name)}</strong><b>${money(priceOf(p))}</b><s>${money(p.price)}</s><time></time></span>`;
    }
    const feat = cfg.products.filter((p) => p.badges.length && p.stock > 0).slice(0, 3);
    $("#hero-featured").innerHTML = `<p class="featured__label">${lang === "en" ? "Featured" : "À la une"}</p>` + feat.map((p) => `<button type="button" class="mini glass" data-product="${p.id}"><img src="${p.image}" alt="" width="52" height="52" loading="lazy"><span>${p.badges.map((b) => `<span class="badge badge--${b}">${t(b)}</span>`).join("")}<strong>${esc(p.name)}</strong><small>${money(priceOf(p))} · ${esc(tr(p.notes))}</small></span></button>`).join("");
    tickOffer();
  }
  function goSlide(n, user) {
    if (!has("#hero-media")) return;
    const total = cfg.slides.length;
    const prev = slide;
    slide = (n + total) % total;
    if (prev === slide) return;
    const slides = $$(".hero__slide"), texts = $$(".hero__text"), bars = $$(".hero__bar");
    slides.forEach((s, i) => s.classList.toggle("is-active", i === slide));
    texts.forEach((tx, i) => {
      tx.classList.remove("is-leaving");
      if (i === prev) { tx.classList.remove("is-active"); tx.classList.add("is-leaving"); setTimeout(() => tx.classList.remove("is-leaving"), 500); }
      tx.classList.toggle("is-active", i === slide);
      tx.setAttribute("aria-hidden", String(i !== slide));
      tx.querySelectorAll("a").forEach((a) => (i === slide ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1")));
    });
    bars.forEach((b, i) => {
      b.setAttribute("aria-selected", "false");
      if (i === slide) { void b.offsetWidth; b.setAttribute("aria-selected", "true"); }
    });
    $("#slide-n").textContent = String(slide + 1).padStart(2, "0");
    $(".hero").classList.toggle("is-light", slide === 1);
    if (user) restartSlides();
  }
  function restartSlides() {
    clearInterval(slideTimer);
    if (paused || reduced) return;
    // relance l'animation de la barre active
    const b = $$(".hero__bar")[slide];
    if (b) { b.setAttribute("aria-selected", "false"); void b.offsetWidth; b.setAttribute("aria-selected", "true"); }
    slideTimer = setInterval(() => goSlide(slide + 1), cfg.slideDelay);
  }
  function initHero() {
    if (!has("#hero-media")) return;
    renderHero();
    $("#slide-next").addEventListener("click", () => goSlide(slide + 1, true));
    $("#slide-prev").addEventListener("click", () => goSlide(slide - 1, true));
    $("#hero-bars").addEventListener("click", (e) => { const b = e.target.closest(".hero__bar"); if (b) goSlide($$(".hero__bar").indexOf(b), true); });
    const pauseBtn = $("#slide-pause");
    const setPause = (p) => {
      paused = p;
      $(".hero").classList.toggle("is-paused", p);
      pauseBtn.innerHTML = `<svg class="ic"><use href="#i-${p ? "play" : "pause"}"/></svg>`;
      pauseBtn.setAttribute("aria-label", p ? (lang === "en" ? "Play" : "Lecture") : "Pause");
      restartSlides();
    };
    pauseBtn.addEventListener("click", () => setPause(!paused));
    if (reduced) setPause(true);
    // Pause quand l'onglet est caché ou le hero hors écran
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(slideTimer) : restartSlides()));
    // Glisser (mobile)
    let x0 = null;
    const hero = $(".hero");
    hero.addEventListener("touchstart", (e) => { if (!e.target.closest("input, .search-panel")) x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) goSlide(slide + (dx < 0 ? 1 : -1), true);
      x0 = null;
    });
    hero.addEventListener("click", (e) => {
      const q = e.target.closest("[data-q]");
      if (q) { const input = $(".hero__field input"); input.value = q.dataset.q; runSearchToGrid(q.dataset.q); }
      const p = e.target.closest("[data-product]");
      if (p) { e.preventDefault(); openProduct(p.dataset.product); }
    });
    $(".hero__field .btn").addEventListener("click", (e) => { e.preventDefault(); runSearchToGrid($(".hero__field input").value); });
    $("#hero-deal").addEventListener("click", (e) => { e.preventDefault(); openProduct(cfg.offer.productId); });
    restartSlides();
  }

  // ============================================================
  //  Compteurs animés
  // ============================================================
  function initCounters() {
    if (has("#stat-products")) $("#stat-products").dataset.count = cfg.products.length;
    if (has("#stat-countries")) $("#stat-countries").dataset.count = new Set(cfg.products.flatMap((p) => p.country.split(" & "))).size;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, end = +el.dataset.count;
        if (reduced) { el.textContent = end; return; }
        const t0 = performance.now(), dur = 1600;
        const step = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((el) => io.observe(el));
  }

  // ============================================================
  //  Recherche instantanée (suggestions, historique, clavier)
  // ============================================================
  const searchIndex = () => cfg.products.map((p) => ({
    p,
    hay: norm([p.name, p.country, p.country_en, p.region, p.variety, p.notes.fr, p.notes.en, p.tags, t(p.roast), p.methods.map((m) => t(m)).join(" "), p.continent, I.dyn[p.continent].join(" ")].join(" "))
  }));
  const SYN = { mild: "doux", chocolate: "chocolat", fruity: "fruite", spicy: "epices", strong: "intense", filter: "filtre", milk: "lait", soft: "doux", corse: "intense", fort: "intense" };
  function searchProducts(q) {
    const words = norm(q).split(/\s+/).filter(Boolean).map((w) => SYN[w] || w);
    if (!words.length) return [];
    return searchIndex()
      .map(({ p, hay }) => {
        let score = 0;
        for (const w of words) {
          if (!hay.includes(w)) return null;
          if (norm(p.name).startsWith(w)) score += 5;
          if (norm(p.name).includes(w)) score += 3;
          if (norm(p.country).includes(w)) score += 2;
          score += 1;
        }
        return { p, score: score + (p.stock > 0 ? 1 : 0) };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }
  function highlight(text, q) {
    const words = norm(q).split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) return esc(text);
    const n = norm(text);
    const marks = new Array(text.length).fill(false);
    words.forEach((w) => { let i = n.indexOf(w); while (i > -1) { for (let k = i; k < i + w.length; k++) marks[k] = true; i = n.indexOf(w, i + 1); } });
    let out = "", open = false;
    for (let i = 0; i < text.length; i++) {
      if (marks[i] && !open) { out += "<mark>"; open = true; }
      if (!marks[i] && open) { out += "</mark>"; open = false; }
      out += esc(text[i]);
    }
    return out + (open ? "</mark>" : "");
  }
  function addHistory(q) {
    q = q.trim();
    if (q.length < 2) return;
    history = [q].concat(history.filter((h) => norm(h) !== norm(q))).slice(0, 6);
    store.set("history", history);
  }
  function renderPanel(panel, q) {
    q = q.trim();
    let html = "";
    if (!q) {
      if (history.length) {
        html += `<h5>${t("recent")}<button type="button" data-clear-history>${t("clear")}</button></h5>` +
          history.map((h) => `<button type="button" class="s-item" data-q="${esc(h)}"><svg class="ic"><use href="#i-history"/></svg><em>${esc(h)}</em></button>`).join("");
      }
      html += `<h5>${t("suggestions")}</h5><div class="s-tags">${["doux", "intense", "chocolat", "fruite", "espresso", "filtre", "afrique"].map((s) => `<button type="button" class="chip" data-q="${esc(t(s))}">${esc(t(s))}</button>`).join("")}</div>`;
      const rec = recommended().slice(0, 3);
      html += `<h5>${t("products")}</h5>` + rec.map((p) => sItem(p, "")).join("");
    } else {
      const res = searchProducts(q);
      if (!res.length) html = `<p class="s-none">${esc(t("noResult", { q }))}</p>`;
      else {
        html = `<h5>${t("products")} <span>${res.length}</span></h5>` + res.slice(0, 6).map((p) => sItem(p, q)).join("");
        if (res.length > 6 || panel.id !== "sheet-results") html += `<button type="button" class="s-item" data-show-all="${esc(q)}"><svg class="ic"><use href="#i-right"/></svg><em>${esc(t("show", { n: res.length }))}</em></button>`;
      }
    }
    panel.innerHTML = html;
    panel.hidden = false;
  }
  const sItem = (p, q) => `<button type="button" class="s-item" data-product="${p.id}"><img src="${p.image}" alt="" width="42" height="42" loading="lazy"><span><strong>${highlight(p.name, q)}</strong><small>${highlight(country(p) + " · " + tr(p.notes), q)}</small></span><b class="price small">${money(priceOf(p))}</b></button>`;

  function initSearch() {
    $$(".js-search").forEach((input) => {
      const panel = $("#" + input.dataset.panel);
      let sel = -1;
      const items = () => $$(".s-item", panel);
      const update = () => { sel = -1; renderPanel(panel, input.value); };
      input.addEventListener("focus", update);
      input.addEventListener("input", update);
      input.addEventListener("keydown", (e) => {
        const list = items();
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (!list.length) return;
          sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
          list.forEach((it, i) => it.classList.toggle("is-sel", i === sel));
          list[sel].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (sel > -1 && list[sel]) list[sel].click();
          else if (input.value.trim()) runSearchToGrid(input.value);
        } else if (e.key === "Escape") {
          panel.hidden = panel.id !== "sheet-results";
          input.blur();
          if (panel.id === "sheet-results") closeSheet();
        }
      });
      panel.addEventListener("mousedown", (e) => e.preventDefault()); // garde le focus dans le champ
      panel.addEventListener("click", (e) => {
        const p = e.target.closest("[data-product]");
        const q = e.target.closest("[data-q]");
        const all = e.target.closest("[data-show-all]");
        if (e.target.closest("[data-clear-history]")) { history = []; store.set("history", history); update(); return; }
        if (p) { addHistory(input.value || ""); closeSearchUI(); openProduct(p.dataset.product); }
        else if (q) { input.value = q.dataset.q; update(); input.focus(); }
        else if (all) runSearchToGrid(all.dataset.showAll);
      });
      input.addEventListener("blur", () => setTimeout(() => { if (panel.id !== "sheet-results" && document.activeElement !== input) panel.hidden = true; }, 120));
    });
    // Raccourci « / »
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.target.closest("input, textarea, select")) return;
      e.preventDefault();
      const desk = $("#nav-search input");
      if (desk.offsetParent) desk.focus(); else openSheet();
    });
    $("#search-open").addEventListener("click", openSheet);
    $("[data-close-sheet]").addEventListener("click", closeSheet);
  }
  function openSheet() {
    $("#search-sheet").hidden = false;
    document.body.classList.add("is-locked");
    const i = $("#search-sheet input");
    setTimeout(() => i.focus(), 30);
    renderPanel($("#sheet-results"), i.value);
  }
  function closeSheet() { $("#search-sheet").hidden = true; document.body.classList.remove("is-locked"); }
  function closeSearchUI() {
    $$(".search-panel").forEach((p) => { if (p.id !== "sheet-results") p.hidden = true; });
    if (!$("#search-sheet").hidden) closeSheet();
    if (document.activeElement && document.activeElement.classList.contains("js-search")) document.activeElement.blur();
  }
  let searchQuery = "";
  function runSearchToGrid(q) {
    q = (q || "").trim();
    addHistory(q);
    if (!has("#grid")) { location.href = SHOP + (q ? "?q=" + encodeURIComponent(q) : ""); return; }
    searchQuery = q;
    closeSearchUI();
    renderGrid();
    $("#boutique").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  // ============================================================
  //  Filtres & tri
  // ============================================================
  const intensityGroup = (p) => (p.intensity <= 2 ? "doux" : p.intensity === 3 ? "equilibre" : "intense");
  const GROUPS = [
    ["continent", ["afrique", "ameriques", "asie"], (p, v) => p.continent === v],
    ["roast", ["light", "medium", "medium-dark", "dark"], (p, v) => p.roast === v],
    ["intensity", ["doux", "equilibre", "intense"], (p, v) => intensityGroup(p) === v],
    ["method", ["espresso", "filtre", "piston", "moka", "cafetiere"], (p, v) => p.methods.includes(v)],
    ["notes", ["chocolat", "caramel", "fruite", "floral", "epices"], (p, v) => p.tags.includes(v)]
  ];
  function filtered(ignoreSearch) {
    let list = cfg.products.filter((p) => {
      for (const [key, , test] of GROUPS) if (filters[key].length && !filters[key].some((v) => test(p, v))) return false;
      if (priceOf(p) > filters.price) return false;
      if (filters.stock && p.stock <= 0) return false;
      if (filters.promo && !isPromo(p)) return false;
      return true;
    });
    if (searchQuery && !ignoreSearch) {
      const ids = searchProducts(searchQuery).map((p) => p.id);
      list = list.filter((p) => ids.includes(p.id));
      if (sort === "smart") list.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }
    const viewedTags = recent.map(byId).filter(Boolean).map((p) => p.tags).join(" ");
    const smartScore = (p) => (p.stock > 0 ? 100 : 0) + (p.badges.includes("best") ? 12 : 0) + (isPromo(p) ? 10 : 0) + (p.badges.includes("new") ? 6 : 0) + p.tags.split(" ").filter((tg) => viewedTags.includes(tg)).length * 2;
    const by = {
      smart: (a, b) => smartScore(b) - smartScore(a),
      best: (a, b) => (b.badges.includes("best") - a.badges.includes("best")) || ((b.stock > 0) - (a.stock > 0)),
      new: (a, b) => (b.badges.includes("new") - a.badges.includes("new")),
      "price-asc": (a, b) => priceOf(a) - priceOf(b),
      "price-desc": (a, b) => priceOf(b) - priceOf(a),
      intense: (a, b) => b.intensity - a.intensity || b.body - a.body,
      soft: (a, b) => a.intensity - b.intensity || a.body - b.body
    };
    if (!(searchQuery && sort === "smart" && !ignoreSearch)) list.sort(by[sort]);
    return list;
  }
  function activeCount() {
    return GROUPS.reduce((n, [k]) => n + filters[k].length, 0) + (filters.price < maxPrice ? 1 : 0) + (filters.stock ? 1 : 0) + (filters.promo ? 1 : 0) + (searchQuery ? 1 : 0);
  }
  function renderFilters() {
    if (!has("#filters-body")) return;
    const body = $("#filters-body");
    body.innerHTML = GROUPS.map(([key, values]) => `<div class="fgroup"><h4>${t("f_" + key)}</h4><div class="chips">${values.map((v) => `<button type="button" class="chip" data-f="${key}" data-v="${v}" aria-pressed="${filters[key].includes(v)}">${esc(t(v))}</button>`).join("")}</div></div>`).join("") +
      `<div class="fgroup"><h4>${t("f_price")}</h4><input type="range" class="range" id="price-range" min="3000" max="${maxPrice}" step="500" value="${filters.price}" aria-label="${t("f_price")}"><div class="range-out"><span>${money(3000)}</span><b id="price-out">${money(filters.price)}</b></div></div>` +
      `<div class="fgroup"><h4>${t("f_more")}</h4><label class="toggle"><span>${t("f_stock")}</span><input type="checkbox" id="f-stock" ${filters.stock ? "checked" : ""}></label><label class="toggle"><span>${t("f_promo")}</span><input type="checkbox" id="f-promo" ${filters.promo ? "checked" : ""}></label></div>`;
  }
  function renderActive() {
    const chips = [];
    if (searchQuery) chips.push([`« ${searchQuery} »`, "search", ""]);
    GROUPS.forEach(([k]) => filters[k].forEach((v) => chips.push([t(v), k, v])));
    if (filters.price < maxPrice) chips.push(["≤ " + money(filters.price), "price", ""]);
    if (filters.stock) chips.push([t("f_stock"), "stock", ""]);
    if (filters.promo) chips.push([t("f_promo"), "promo", ""]);
    $("#active-filters").innerHTML = chips.map(([label, k, v]) => `<button type="button" class="chip is-on" data-rm="${k}" data-v="${esc(v)}">${esc(label)} <svg class="ic"><use href="#i-close"/></svg></button>`).join("");
    const n = activeCount();
    $("#filters-count").hidden = !n;
    $("#filters-count").textContent = n;
  }
  function resetFilters() {
    if (!has("#grid")) return;
    GROUPS.forEach(([k]) => (filters[k] = []));
    filters.price = maxPrice; filters.stock = false; filters.promo = false;
    searchQuery = "";
    $$(".js-search").forEach((i) => (i.value = ""));
    renderFilters();
    renderGrid();
  }
  function applyQuickFilter(type, value) {
    if (!has("#grid")) { location.href = SHOP + "?" + encodeURIComponent(type) + "=" + encodeURIComponent(value); return; }
    resetFilters();
    if (filters[type] && !filters[type].includes(value)) filters[type].push(value);
    renderFilters();
    renderGrid();
    $("#boutique").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }
  function initFilters() {
    if (!has("#filters-body")) return;
    // Filtres transmis par l'adresse (ex. cafes.html?continent=afrique ou ?q=chocolat)
    const params = new URLSearchParams(location.search);
    params.forEach((v, k) => {
      if (k === "q") searchQuery = v;
      else if (filters[k] && Array.isArray(filters[k]) && !filters[k].includes(v)) filters[k].push(v);
      else if (k === "promo" || k === "stock") filters[k] = true;
    });
    if (searchQuery) $$(".js-search").forEach((i) => (i.value = searchQuery));
    renderFilters();
    const body = $("#filters-body");
    body.addEventListener("click", (e) => {
      const c = e.target.closest("[data-f]");
      if (!c) return;
      const arr = filters[c.dataset.f], v = c.dataset.v;
      const i = arr.indexOf(v);
      i > -1 ? arr.splice(i, 1) : arr.push(v);
      c.setAttribute("aria-pressed", String(i < 0));
      renderGrid();
    });
    body.addEventListener("input", (e) => {
      if (e.target.id === "price-range") { filters.price = +e.target.value; $("#price-out").textContent = money(filters.price); renderGrid(); }
    });
    body.addEventListener("change", (e) => {
      if (e.target.id === "f-stock") filters.stock = e.target.checked;
      if (e.target.id === "f-promo") filters.promo = e.target.checked;
      renderGrid();
    });
    $("#active-filters").addEventListener("click", (e) => {
      const c = e.target.closest("[data-rm]");
      if (!c) return;
      const k = c.dataset.rm;
      if (k === "search") { searchQuery = ""; $$(".js-search").forEach((i) => (i.value = "")); }
      else if (k === "price") filters.price = maxPrice;
      else if (k === "stock" || k === "promo") filters[k] = false;
      else filters[k] = filters[k].filter((v) => v !== c.dataset.v);
      renderFilters();
      renderGrid();
    });
    $("#filters-reset").addEventListener("click", resetFilters);
    $("#empty-reset").addEventListener("click", resetFilters);
    $("#sort").addEventListener("change", (e) => { sort = e.target.value; renderGrid(); });
    const panel = $("#filters");
    const setOpen = (o) => { panel.classList.toggle("is-open", o); document.body.classList.toggle("is-locked", o); $("#filters-btn").setAttribute("aria-expanded", String(o)); };
    $("#filters-btn").addEventListener("click", () => setOpen(true));
    $("#filters-close").addEventListener("click", () => setOpen(false));
    $("#filters-apply").addEventListener("click", () => { setOpen(false); $("#boutique").scrollIntoView(); });
  }

  // ============================================================
  //  Cartes produits
  // ============================================================
  const dots = (n) => `<span class="dots" role="img" aria-label="${t("intensity")} ${n}/5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  function badges(p) {
    const b = [];
    if (isPromo(p)) b.push(`<span class="badge badge--promo">${t("promo")} −${Math.round(cfg.offer.discount * 100)} %</span>`);
    p.badges.forEach((x) => b.push(`<span class="badge badge--${x}">${t(x)}</span>`));
    if (p.stock <= 0) b.push(`<span class="badge badge--out">${t("soldOut")}</span>`);
    return b.join("");
  }
  function stockLabel(p) {
    if (p.stock <= 0) return `<span class="stock">${t("soldOut")}</span>`;
    if (p.stock <= 8) return `<span class="stock is-low">${t("low", { n: p.stock })}</span>`;
    return `<span class="stock">${t("inStock")}</span>`;
  }
  function card(p, i) {
    const second = p.gallery ? p.gallery[0] : null;
    const w = wish.includes(p.id);
    return `<article class="pcard reveal" style="--d:${(i % 4) * 70}ms" data-id="${p.id}">
      <div class="pcard__media" data-open="${p.id}">
        <img src="${p.image}" alt="${esc(p.name)}" width="600" height="750" loading="lazy" decoding="async">${second ? `<img src="${second}" alt="" width="600" height="750" loading="lazy" decoding="async">` : ""}
        <div class="pcard__badges">${badges(p)}</div>
        <button type="button" class="pcard__quick" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}><svg class="ic"><use href="#i-plus"/></svg> ${p.stock <= 0 ? t("soldOut") : t("addCart")}</button>
      </div>
      <div class="pcard__tools">
        <button type="button" class="tool heart${w ? " is-on" : ""}" data-wish="${p.id}" aria-pressed="${w}" aria-label="${w ? t("wishRemove") : t("wishAdd")} : ${esc(p.name)}"><svg class="ic"><use href="#i-heart"/></svg></button>
        <button type="button" class="tool tool--compare${compare.includes(p.id) ? " is-on" : ""}" data-compare="${p.id}" aria-pressed="${compare.includes(p.id)}" aria-label="${t("compare")} : ${esc(p.name)}"><svg class="ic"><use href="#i-compare"/></svg></button>
      </div>
      <div class="pcard__body">
        <p class="pcard__origin"><span>${esc(country(p))}</span>${stockLabel(p)}</p>
        <h3 data-open="${p.id}">${esc(p.name)}</h3>
        <p class="pcard__notes">${esc(tr(p.notes))}</p>
        <div class="pcard__foot"><span class="price">${money(priceOf(p))}${isPromo(p) ? `<s>${money(p.price)}</s>` : ""}<small>· ${esc(p.size)}</small></span>${dots(p.intensity)}</div>
      </div>
    </article>`;
  }
  function renderGrid() {
    renderFeatured();
    if (!has("#grid")) return;
    const list = filtered();
    const grid = $("#grid");
    grid.innerHTML = list.map(card).join("");
    $("#empty").hidden = list.length > 0;
    $("#result-count").textContent = t(list.length > 1 ? "resultsN" : "results", { n: list.length });
    $("#filters-apply").textContent = t("show", { n: list.length });
    renderActive();
    observeReveal(grid);
  }
  // Accueil : sélection du moment (meilleures ventes, offre, nouveautés)
  function renderFeatured() {
    const box = $("#featured-grid");
    if (!box) return;
    const n = +box.dataset.limit || 4;
    const pick = cfg.products
      .filter((p) => p.stock > 0)
      .map((p) => ({ p, s: (isPromo(p) ? 3 : 0) + (p.badges.includes("best") ? 2 : 0) + (p.badges.includes("new") ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, n)
      .map((x) => x.p);
    box.innerHTML = pick.map(card).join("");
    observeReveal(box);
  }
  // Les trois grandes familles d'origine (accueil et page Origines)
  function renderContinents() {
    const box = $("#continents");
    if (!box) return;
    const img = { afrique: "images/produits/ethiopie.webp", ameriques: "images/produits/colombie.webp", asie: "images/produits/sumatra.webp" };
    const txt = {
      afrique: ["Le berceau du café : fleurs, agrumes et le robusta de chez nous.", "The birthplace of coffee: flowers, citrus and our home-grown robusta."],
      ameriques: ["Rondeur, caramel et chocolat, jusqu'aux grands crus de Jamaïque et de Panama.", "Roundness, caramel and chocolate, up to the grand crus of Jamaica and Panama."],
      asie: ["Des cafés puissants, boisés et épicés, au corps généreux.", "Powerful, woody, spicy coffees with a generous body."]
    };
    box.innerHTML = ["afrique", "ameriques", "asie"].map((c, i) => {
      const list = cfg.products.filter((p) => p.continent === c);
      const countries = Array.from(new Set(list.map(country)));
      return `<a class="continent reveal" style="--d:${i * 90}ms" href="${SHOP}?continent=${c}"><span class="continent__img"><img src="${img[c]}" alt="" width="600" height="750" loading="lazy"></span><span class="continent__body"><small>${esc(t("coffeesFrom", { n: list.length }))}</small><strong>${esc(t(c))}</strong><span>${esc(tr(txt[c]))}</span><em>${esc(countries.join(" · "))}</em></span></a>`;
    }).join("");
    observeReveal(box);
  }
  function renderRails() {
    if (!has("#pour-vous")) return;
    const rec = recommended().slice(0, 8);
    const rv = recent.map(byId).filter(Boolean).slice(0, 8);
    $("#recommended").innerHTML = rec.map(card).join("");
    $("#recent").innerHTML = rv.map(card).join("");
    $("#recommended-block").hidden = !recent.length || !rec.length;
    $("#recent-block").hidden = !rv.length;
    $("#pour-vous").hidden = !rv.length;
    observeReveal($("#pour-vous"));
  }
  // Recommandations : profil de goût (tags des cafés vus, favoris, commandés)
  function recommended() {
    const ordered = account.orders.flatMap((o) => o.items.map((i) => i.id));
    const seed = [...recent, ...wish, ...ordered];
    if (!seed.length) return cfg.products.filter((p) => p.badges.includes("best") && p.stock > 0);
    const weight = {};
    seed.forEach((id) => { const p = byId(id); if (p) p.tags.split(" ").forEach((tg) => (weight[tg] = (weight[tg] || 0) + 1)); });
    const avgInt = seed.map(byId).filter(Boolean).reduce((s, p) => s + p.intensity, 0) / seed.length;
    return cfg.products
      .filter((p) => !recent.slice(0, 2).includes(p.id) && p.stock > 0)
      .map((p) => ({ p, s: p.tags.split(" ").reduce((s, tg) => s + (weight[tg] || 0), 0) - Math.abs(p.intensity - avgInt) * 1.5 + (p.badges.includes("best") ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
  }
  function similar(p) {
    return cfg.products
      .filter((x) => x.id !== p.id)
      .map((x) => ({ x, s: x.tags.split(" ").filter((tg) => p.tags.includes(tg)).length * 2 - Math.abs(x.intensity - p.intensity) + (x.continent === p.continent ? 1 : 0) + (x.stock > 0 ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 4)
      .map((r) => r.x);
  }

  // Délégation des clics sur toutes les cartes produit
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { e.preventDefault(); addToCart(add.dataset.add, null, 1, add); return; }
    const w = e.target.closest("[data-wish]");
    if (w) { e.preventDefault(); toggleWish(w.dataset.wish); return; }
    const c = e.target.closest("[data-compare]");
    if (c) { e.preventDefault(); toggleCompare(c.dataset.compare); return; }
    const o = e.target.closest("[data-open]");
    if (o) { openProduct(o.dataset.open); return; }
  });

  // ============================================================
  //  Favoris
  // ============================================================
  function toggleWish(id) {
    const on = !wish.includes(id);
    wish = on ? [id, ...wish] : wish.filter((x) => x !== id);
    store.set("wish", wish);
    $$(`[data-wish="${id}"]`).forEach((b) => {
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
      b.classList.remove("is-anim");
      if (on) { void b.offsetWidth; b.classList.add("is-anim"); }
    });
    if (on) toast(t("wishToast"));
    renderWish();
  }
  function renderWish() {
    const items = wish.map(byId).filter(Boolean);
    $("#wish-lines").innerHTML = items.map((p) => `<li class="line"><img src="${p.image}" alt="" width="72" height="88" data-open="${p.id}"><div><strong>${esc(p.name)}</strong><small>${esc(tr(p.notes))}</small><div class="price small">${money(priceOf(p))}</div></div><div class="line__end"><button type="button" class="icon-btn icon-btn--sm" data-wish="${p.id}" aria-label="${t("wishRemove")}"><svg class="ic"><use href="#i-trash"/></svg></button><button type="button" class="btn btn--dark btn--sm" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? t("soldOut") : t("add")}</button></div></li>`).join("");
    $("#wish-empty").hidden = items.length > 0;
    const c = $("#wish-count");
    c.hidden = !items.length;
    if (c.textContent !== String(items.length)) { c.textContent = items.length; bump(c); }
    $("#wish-btn").classList.toggle("is-on", items.length > 0);
  }

  // ============================================================
  //  Comparaison
  // ============================================================
  function toggleCompare(id) {
    if (compare.includes(id)) compare = compare.filter((x) => x !== id);
    else if (compare.length >= 3) { toast(t("compareMax")); return; }
    else compare.push(id);
    $$(`[data-compare="${id}"]`).forEach((b) => { b.classList.toggle("is-on", compare.includes(id)); b.setAttribute("aria-pressed", String(compare.includes(id))); });
    renderCompareBar();
  }
  function renderCompareBar() {
    const bar = $("#compare-bar");
    bar.hidden = !compare.length;
    $("#compare-items").innerHTML = compare.map((id) => { const p = byId(id); return `<img src="${p.image}" alt="${esc(p.name)}" width="36" height="36">`; }).join("");
    $("#compare-open").disabled = compare.length < 2;
  }
  function openCompare() {
    const ps = compare.map(byId);
    const row = (label, fn) => `<tr><th scope="row">${label}</th>${ps.map((p) => `<td>${fn(p)}</td>`).join("")}</tr>`;
    $("#compare-body").innerHTML = closeBtn() + `<div class="cmp"><h2>${t("compareTitle")}</h2><div class="scroll"><table>
      <tr><th></th>${ps.map((p) => `<td><img src="${p.image}" alt="" width="150" height="150"><strong>${esc(p.name)}</strong></td>`).join("")}</tr>
      ${row(t("price"), (p) => money(priceOf(p)) + " · " + esc(p.size))}
      ${row(t("origin"), (p) => esc(country(p)) + "<br><small class='muted'>" + esc(p.region) + "</small>")}
      ${row(t("intensity"), (p) => dots(p.intensity))}
      ${row(t("acidity"), (p) => dots(p.acidity))}
      ${row(t("body"), (p) => dots(p.body))}
      ${row(t("roasting"), (p) => esc(t(p.roast)))}
      ${row(t("process"), (p) => esc(tr(p.process)))}
      ${row(t("notes"), (p) => esc(tr(p.notes)))}
      ${row(t("methodsL"), (p) => p.methods.map((m) => esc(t(m))).join(", "))}
      ${row("", (p) => `<button type="button" class="btn btn--dark btn--sm" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? t("soldOut") : t("addCart")}</button>`)}
    </table></div></div>`;
    showModal("compare-modal");
  }

  // ============================================================
  //  Fiche produit
  // ============================================================
  function openProduct(id) {
    const p = byId(id);
    if (!p) return;
    recent = [id, ...recent.filter((x) => x !== id)].slice(0, 10);
    store.set("recent", recent);
    account.viewed = Array.from(new Set([...(account.viewed || []), id]));
    store.set("account", account);
    const pics = imgs(p);
    const w = wish.includes(p.id);
    const grind = p.methods.includes("espresso") ? "Espresso" : p.methods.includes("filtre") ? "Filtre" : cfg.grinds[0];
    $("#product-body").innerHTML = closeBtn() + `<div class="pd">
      <div class="pd__gallery"><img src="${pics[0]}" alt="${esc(p.name)}" id="pd-main" width="900" height="900">
        ${pics.length > 1 ? `<div class="pd__thumbs">${pics.map((src, i) => `<button type="button" class="${i === 0 ? "is-on" : ""}" data-src="${src}" aria-label="Image ${i + 1}"><img src="${src}" alt="" width="52" height="52"></button>`).join("")}</div>` : ""}
        <div class="pcard__badges">${badges(p)}</div>
      </div>
      <div class="pd__info">
        <p class="eyebrow">${esc(country(p))} · ${esc(p.region)}</p>
        <h2>${esc(p.name)}</h2>
        <p class="pd__story">${esc(tr(p.story))}</p>
        <div class="pd__row"><span class="stars" aria-hidden="true">${"<svg class='ic'><use href='#i-star'/></svg>".repeat(5)}</span><a href="#pd-reviews" class="link">${t("reviews")} (${p.reviews.length})</a>${stockLabel(p).replace('class="stock', 'class="stock ' + (p.stock > 8 ? "is-ok" : ""))}</div>
        <div class="pd__price">${money(priceOf(p))}${isPromo(p) ? `<s>${money(p.price)}</s>` : ""}<small>/ ${esc(p.size)}</small></div>
        <label class="field"><span>${t("grind")}</span><select id="pd-grind">${cfg.grinds.map((g) => `<option ${g === grind ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></label>
        <div class="pd__buy">
          <div class="qty"><button type="button" data-pdq="-1" aria-label="−"><svg class="ic"><use href="#i-minus"/></svg></button><span id="pd-qty">1</span><button type="button" data-pdq="1" aria-label="+"><svg class="ic"><use href="#i-plus"/></svg></button></div>
          <button type="button" class="btn btn--dark btn--lg" id="pd-add" ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? t("soldOut") : t("addCart")} <svg class="ic"><use href="#i-bag"/></svg></button>
          <button type="button" class="tool heart${w ? " is-on" : ""}" data-wish="${p.id}" aria-pressed="${w}" aria-label="${t("wishAdd")}"><svg class="ic"><use href="#i-heart"/></svg></button>
        </div>
        ${p.stock <= 0 ? `<a class="btn btn--line btn--block" target="_blank" rel="noopener" href="${waLink((lang === "en" ? "Hello, please let me know when this is back in stock: " : "Bonjour, prévenez-moi quand ce café sera de retour : ") + p.name)}">${t("notify")}</a>` : ""}
        <div class="bars">
          <div class="bar"><span>${t("intensity")}</span><i><b style="--w:${p.intensity * 20}%"></b></i></div>
          <div class="bar"><span>${t("acidity")}</span><i><b style="--w:${p.acidity * 20}%"></b></i></div>
          <div class="bar"><span>${t("body")}</span><i><b style="--w:${p.body * 20}%"></b></i></div>
        </div>
        <dl class="specs">
          <div><dt>${t("origin")}</dt><dd>${esc(country(p))}</dd></div><div><dt>${t("region")}</dt><dd>${esc(p.region)}</dd></div>
          <div><dt>${t("altitude")}</dt><dd>${esc(p.altitude)}</dd></div><div><dt>${t("variety")}</dt><dd>${esc(p.variety)}</dd></div>
          <div><dt>${t("process")}</dt><dd>${esc(tr(p.process))}</dd></div><div><dt>${t("roasting")}</dt><dd>${esc(t(p.roast))}</dd></div>
        </dl>
        <div class="pd__acc">
          <details open><summary>${t("notes")}</summary><p>${esc(tr(p.notes))}</p></details>
          <details><summary>${t("roasting")}</summary><p>${esc(tr(I.roastText[p.roast]))}</p></details>
          <details><summary>${t("prep")}</summary><ul>${p.methods.map((m) => `<li><strong>${esc(t(m))} :</strong> ${esc(tr(I.prep[m]))}</li>`).join("")}</ul></details>
          <details id="pd-reviews"><summary>${t("reviews")} (${p.reviews.length})</summary>${p.reviews.length ? p.reviews.map((r) => `<div class="review"><p>${esc(r.text)}</p><cite>${esc(r.name)}</cite></div>`).join("") : `<p>${t("noReviews")}</p><p><a class="link" target="_blank" rel="noopener" href="${waLink((lang === "en" ? "My review of " : "Mon avis sur le ") + p.name + " : ")}">${t("leaveReview")} →</a></p>`}</details>
        </div>
        <button type="button" class="btn btn--line btn--sm" data-compare="${p.id}" aria-pressed="${compare.includes(p.id)}"><svg class="ic"><use href="#i-compare"/></svg> ${t("compare")}</button>
      </div>
    </div>
    <div class="pd__similar"><h3>${t("similar")}</h3><div class="rail">${similar(p).map(card).join("")}</div></div>`;
    showModal("product-modal");
    const body = $("#product-body");
    $$(".reveal", body).forEach((el) => el.classList.add("is-visible"));
    requestAnimationFrame(() => setTimeout(() => $$(".bar b", body).forEach((b) => (b.style.width = b.style.getPropertyValue("--w"))), 80));
    let qty = 1;
    body.querySelectorAll("[data-pdq]").forEach((b) => b.addEventListener("click", () => { qty = Math.max(1, Math.min(20, qty + +b.dataset.pdq)); $("#pd-qty").textContent = qty; }));
    body.querySelectorAll(".pd__thumbs button").forEach((b) => b.addEventListener("click", () => { $("#pd-main").src = b.dataset.src; body.querySelectorAll(".pd__thumbs button").forEach((x) => x.classList.toggle("is-on", x === b)); }));
    const addBtn = $("#pd-add");
    if (addBtn) addBtn.addEventListener("click", () => addToCart(p.id, $("#pd-grind").value, qty, addBtn));
    renderRails();
  }

  // ============================================================
  //  Panier
  // ============================================================
  function addToCart(id, grind, qty, btn) {
    const p = byId(id);
    if (!p || p.stock <= 0) return;
    grind = grind || cfg.grinds[0];
    const line = cart.find((l) => l.id === id && l.grind === grind);
    if (line) line.qty = Math.min(20, line.qty + qty);
    else cart.push({ id, grind, qty });
    saveCart();
    toast(t("addedToast", { p: p.name }));
    bump($("#cart-count"));
    if (btn && btn.classList.contains("pcard__quick")) {
      const html = btn.innerHTML;
      btn.classList.add("is-added");
      btn.innerHTML = `<svg class="ic"><use href="#i-check"/></svg> ${t("added")}`;
      setTimeout(() => { btn.classList.remove("is-added"); btn.innerHTML = html; }, 1400);
    }
    document.dispatchEvent(new CustomEvent("aube:add", { detail: { el: btn } }));
  }
  function saveCart() { store.set("cart", cart); renderCart(); }

  function shippingInfo(sub) {
    const form = $("#order-form");
    const mode = form.mode.value;
    const commune = form.commune.value;
    if (mode === "retrait") return { fee: 0, label: t("free") };
    const free = (appliedCode && codeInfo(appliedCode) && codeInfo(appliedCode).type === "shipping");
    const zone = cfg.delivery.zones.find((z) => z.name === commune);
    const city = cfg.delivery.interior.find((z) => z.name === commune);
    let fee = null;
    if (zone) fee = sub >= cfg.delivery.freeFrom || free ? 0 : zone.fee;
    if (city) fee = free ? 0 : city.fee;
    if (fee == null) return { fee: 0, label: t("chooseCity"), unknown: true };
    if (mode === "express" && !city) fee += cfg.delivery.expressFee;
    return { fee, label: fee ? money(fee) : t("free") };
  }
  const codeInfo = (c) => (cfg.wheel.prizes || []).find((p) => p.code === String(c || "").toUpperCase());
  function totals() {
    const sub = cart.reduce((s, l) => { const p = byId(l.id); return s + (p ? priceOf(p) * l.qty : 0); }, 0);
    const info = codeInfo(appliedCode);
    const disc = info && info.type === "percent" ? Math.round((sub * info.value) / 100) : 0;
    const ship = shippingInfo(sub);
    return { sub, disc, ship, total: sub - disc + ship.fee };
  }
  function renderCart() {
    const lines = $("#cart-lines");
    cart = cart.filter((l) => byId(l.id));
    lines.innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<li class="line"><img src="${p.image}" alt="" width="72" height="88" data-open="${p.id}"><div><strong>${esc(p.name)}</strong><small>${money(priceOf(p))} · ${esc(p.size)}</small>
        <select data-grind="${i}" aria-label="${t("grind")}">${cfg.grinds.map((g) => `<option ${g === l.grind ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></div>
        <div class="line__end"><button type="button" class="icon-btn icon-btn--sm" data-rm-line="${i}" aria-label="${lang === "en" ? "Remove" : "Retirer"}"><svg class="ic"><use href="#i-trash"/></svg></button>
        <div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="−"><svg class="ic"><use href="#i-minus"/></svg></button><span>${l.qty}</span><button type="button" data-q="${i}" data-d="1" aria-label="+"><svg class="ic"><use href="#i-plus"/></svg></button></div></div></li>`;
    }).join("");
    const n = cart.reduce((s, l) => s + l.qty, 0);
    const c = $("#cart-count");
    c.hidden = !n;
    c.textContent = n;
    const empty = !cart.length;
    $("#cart-empty").hidden = !empty;
    $("#order-form").hidden = empty;
    $("#ship-meter").hidden = empty;
    renderTotals();
  }
  function renderTotals() {
    const { sub, disc, ship, total } = totals();
    const left = cfg.delivery.freeFrom - sub;
    $("#ship-text").textContent = left > 0 ? t("freeLeft", { n: money(left) }) : t("freeOk");
    $("#ship-bar").style.width = Math.min(100, (sub / cfg.delivery.freeFrom) * 100) + "%";
    $("#totals").innerHTML = `<dt>${t("subtotal")}</dt><dd>${money(sub)}</dd>` +
      (disc ? `<dt>${t("discount")} (${esc(appliedCode)})</dt><dd class="is-save">− ${money(disc)}</dd>` : "") +
      `<dt>${t("shipping")}</dt><dd>${esc(ship.label)}</dd>` +
      `<dt class="grand">${t("total")}</dt><dd class="grand">${money(total)}${ship.unknown ? " *" : ""}</dd>`;
  }
  function fillCommunes() {
    const sel = $("#commune");
    const cur = sel.value;
    sel.innerHTML = `<option value="">${t("chooseCommune")}</option><optgroup label="${t("abidjan")}">${cfg.delivery.zones.map((z) => `<option value="${esc(z.name)}">${esc(z.name)} · ${money(z.fee)}</option>`).join("")}</optgroup><optgroup label="${t("interior")}">${cfg.delivery.interior.map((z) => `<option value="${esc(z.name)}">${esc(z.name)} · ${money(z.fee)} · ${esc(z.delay)}</option>`).join("")}</optgroup>`;
    sel.value = cur;
    $("#pickup-store").innerHTML = cfg.locations.map((l) => `<option>${esc(l.name)} — ${esc(l.address)}</option>`).join("");
    const pay = $("#pay-select"); const pv = pay.value;
    pay.innerHTML = cfg.payments.filter((p) => p.kind !== "banque").map((p) => `<option>${esc(p.name)}</option>`).join("") + `<option>${lang === "en" ? "Bank transfer" : "Virement bancaire"}</option>`;
    if (pv) pay.value = pv;
  }
  function setErr(form, msg, field) {
    $$(".is-invalid", form).forEach((f) => f.classList.remove("is-invalid"));
    form.querySelector("[data-error]").textContent = msg || "";
    if (field) { const f = field.closest(".field"); if (f) { f.classList.add("is-invalid"); } field.focus(); }
  }
  const phoneOk = (v) => v.replace(/[^\d]/g, "").length >= 8;
  const emailOk = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function initCart() {
    const lines = $("#cart-lines");
    lines.addEventListener("click", (e) => {
      const q = e.target.closest("[data-q]");
      if (q) { const l = cart[+q.dataset.q]; l.qty = Math.max(0, Math.min(20, l.qty + +q.dataset.d)); if (!l.qty) cart.splice(+q.dataset.q, 1); saveCart(); }
      const r = e.target.closest("[data-rm-line]");
      if (r) { cart.splice(+r.dataset.rmLine, 1); saveCart(); }
    });
    lines.addEventListener("change", (e) => {
      const s = e.target.closest("[data-grind]");
      if (s) { cart[+s.dataset.grind].grind = s.value; store.set("cart", cart); }
    });
    const form = $("#order-form");
    form.addEventListener("change", (e) => {
      if (e.target.name === "mode") {
        const pick = form.mode.value === "retrait";
        $$("[data-ship]", form).forEach((el) => (el.hidden = pick));
        $$("[data-pickup]", form).forEach((el) => (el.hidden = !pick));
      }
      renderTotals();
    });
    $("#promo-apply").addEventListener("click", () => {
      const v = $("#promo-code").value.trim().toUpperCase();
      if (!v) return;
      if (codeInfo(v)) { appliedCode = v; store.set("code", v); setErr(form, ""); toast(t("codeOk", { c: v })); }
      else setErr(form, t("codeBad"), $("#promo-code"));
      renderTotals();
    });
    if (appliedCode) $("#promo-code").value = appliedCode;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = form.mode.value;
      if (!form.name.value.trim()) return setErr(form, t("errName"), form.name);
      if (!phoneOk(form.phone.value)) return setErr(form, t("errPhone"), form.phone);
      if (mode !== "retrait" && !form.commune.value) return setErr(form, t("errCommune"), form.commune);
      if (mode !== "retrait" && !form.address.value.trim()) return setErr(form, t("errAddress"), form.address);
      setErr(form, "");
      const { sub, disc, ship, total } = totals();
      const fr = lang !== "en";
      const modeLabel = { livraison: fr ? "Livraison" : "Delivery", express: fr ? "Livraison express (< 3 h)" : "Express delivery (< 3 h)", retrait: fr ? "Retrait en boutique" : "Store pickup" }[mode];
      const msg = [
        fr ? "Bonjour Aube Café ! Je souhaite commander :" : "Hello Aube Café! I'd like to order:",
        "",
        ...cart.map((l) => { const p = byId(l.id); return `• ${l.qty} × ${p.name} (${p.size}, ${l.grind}) — ${money(priceOf(p) * l.qty)}`; }),
        "",
        `${t("subtotal")} : ${money(sub)}`,
        disc ? `${t("discount")} (${appliedCode}) : − ${money(disc)}` : null,
        appliedCode && !disc ? `Code : ${appliedCode}` : null,
        `${t("shipping")} : ${ship.label}`,
        `${t("total")} : ${money(total)}${ship.unknown ? (fr ? " (frais à confirmer)" : " (fees to confirm)") : ""}`,
        "",
        `${fr ? "Mode" : "Method"} : ${modeLabel}`,
        mode === "retrait" ? `${fr ? "Boutique" : "Store"} : ${form.store.value}` : `${fr ? "Adresse" : "Address"} : ${form.address.value.trim()}, ${form.commune.value}`,
        `${fr ? "Nom" : "Name"} : ${form.name.value.trim()}`,
        `${fr ? "Téléphone" : "Phone"} : ${form.phone.value.trim()}`,
        `${fr ? "Paiement souhaité" : "Payment"} : ${form.payment.value}`
      ].filter((x) => x !== null).join("\n");
      window.open(waLink(msg), "_blank", "noopener");
      // Historique de l'espace client (sur cet appareil)
      account.orders.unshift({ date: new Date().toISOString(), total, items: cart.map((l) => ({ id: l.id, qty: l.qty, grind: l.grind })) });
      account.orders = account.orders.slice(0, 20);
      store.set("account", account);
      toast(t("orderToast"));
      cart = [];
      saveCart();
      renderRails();
      closeDrawer();
    });
  }

  // ============================================================
  //  Espace client : commandes, fidélité, badges, recommandations
  // ============================================================
  function renderAccount() {
    const orders = account.orders || [];
    const pts = orders.reduce((s, o) => s + Math.floor(o.total / 1000), 0);
    const tiers = cfg.loyalty.tiers;
    const tier = tiers.filter((x) => pts >= x.min).pop();
    const next = tiers.find((x) => x.min > pts);
    const pct = next ? ((pts - tier.min) / (next.min - tier.min)) * 100 : 100;
    const origins = new Set(orders.flatMap((o) => o.items.map((i) => (byId(i.id) || {}).country)).filter(Boolean));
    const badgesList = [
      ["b_first", orders.length >= 1, "i-spark"],
      ["b_explorer", origins.size >= 3, "i-globe"],
      ["b_fan", orders.length >= 5, "i-award"],
      ["b_curious", (account.viewed || []).length >= 10, "i-search"]
    ];
    const dateFmt = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" });
    const recs = recommended().slice(0, 3);
    $("#account-body").innerHTML = `<p class="muted small">${t("accIntro")}</p>
      <div class="acc-card"><h3>${t("loyalty")}</h3>
        <div class="tier"><span class="tier__medal ${tier.id}"><svg class="ic"><use href="#i-award"/></svg></span><div><strong>${esc(tier[lang] || tier.fr)}</strong><span class="muted small">${pts} ${t("points")}</span></div></div>
        <div class="meter"><i style="width:${pct}%"></i></div>
        <p class="small muted" style="margin:0">${next ? t("nextTier", { n: next.min - pts, t: next[lang] || next.fr }) : t("topTier")}</p>
        <p class="small muted" style="margin:8px 0 0">${t("loyaltyNote")}</p>
      </div>
      <div class="acc-card"><h3>${t("badges")}</h3><div class="badges">${badgesList.map(([k, on, ic]) => `<div class="medal${on ? " is-on" : ""}"><svg class="ic"><use href="#${ic}"/></svg>${t(k)}</div>`).join("")}</div></div>
      ${account.code ? `<div class="acc-card"><h3>${t("myCode")}</h3><span class="wheel__code">${esc(account.code)}</span></div>` : ""}
      <div class="acc-card"><h3>${t("orders")}</h3>${orders.length ? orders.map((o, i) => `<div class="order-row"><span><strong>${dateFmt.format(new Date(o.date))}</strong><br><span class="muted">${o.items.reduce((s, x) => s + x.qty, 0)} × · ${money(o.total)} · ${t("status")}</span></span><button type="button" class="btn btn--line btn--sm" data-reorder="${i}">${t("reorder")}</button></div>`).join("") : `<p class="muted small" style="margin:0">${t("noOrders")}</p>`}</div>
      <div class="acc-card"><h3>${t("forYou")}</h3>${recs.map((p) => `<button type="button" class="s-item" data-open="${p.id}"><img src="${p.image}" alt="" width="42" height="42"><span><strong>${esc(p.name)}</strong><small>${esc(tr(p.notes))}</small></span><b class="price small">${money(priceOf(p))}</b></button>`).join("")}</div>`;
  }
  document.addEventListener("click", (e) => {
    const r = e.target.closest("[data-reorder]");
    if (!r) return;
    const o = account.orders[+r.dataset.reorder];
    o.items.forEach((i) => { const p = byId(i.id); if (p && p.stock > 0) addToCart(i.id, i.grind, i.qty); });
    showDrawer("cart");
  });

  // ============================================================
  //  Origines
  // ============================================================
  let originTab = "all";
  function renderOrigins() {
    if (!has("#origin-list")) return;
    const tabs = ["all", "afrique", "ameriques", "asie"];
    $("#origin-tabs").innerHTML = `<div class="tabs tabs--wrap" role="tablist">${tabs.map((k) => `<button type="button" class="tab" role="tab" data-otab="${k}" aria-selected="${k === originTab}">${t(k)}</button>`).join("")}</div>`;
    const list = cfg.products.filter((p) => originTab === "all" || p.continent === originTab);
    $("#origin-list").innerHTML = list.map((p, i) => `<button type="button" class="origin" data-code="${CODES[p.id] || ""}" data-open="${p.id}" style="--i:${i}"><small>${esc(t(p.continent))} · ${esc(p.altitude)}</small><strong>${esc(country(p))}</strong><small>${esc(p.region)} · ${esc(tr(p.notes))}</small><span class="link">${esc(p.name)} →</span></button>`).join("");
  }
  if (has("#origin-tabs")) $("#origin-tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-otab]"); if (b) { originTab = b.dataset.otab; renderOrigins(); } });

  // ============================================================
  //  Avis (uniquement de vrais avis)
  // ============================================================
  function renderReviews() {
    const box = $("#reviews");
    if (!box) return;
    const list = cfg.testimonials || [];
    if (list.length) {
      box.innerHTML = list.map((r) => `<figure class="review reveal"><span class="stars">${"<svg class='ic'><use href='#i-star'/></svg>".repeat(r.rating || 5)}</span><p>${esc(r.text)}</p><cite>${esc(r.name)}${r.city ? " · " + esc(r.city) : ""}</cite></figure>`).join("");
      return;
    }
    box.innerHTML = `<div class="review-empty reveal"><div><h3>${t("reviewsEmptyT")}</h3><p>${t("reviewsEmpty")}</p></div>
      <form class="review-form" id="review-form" novalidate>
        <fieldset class="rate" aria-label="Note">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="r${n}" value="${n}" ${n === 5 ? "checked" : ""}><label for="r${n}" aria-label="${n}/5"><svg class="ic"><use href="#i-star"/></svg></label>`).join("")}</fieldset>
        <label class="field"><span>${t("yourName")}</span><input name="name" autocomplete="given-name" required></label>
        <label class="field"><span>${t("yourReview")}</span><textarea name="text" rows="3" required></textarea></label>
        <p class="form-error" data-error role="alert"></p>
        <button type="submit" class="btn btn--dark">${t("sendReview")}</button>
      </form></div>`;
    $("#review-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.name.value.trim()) return setErr(f, t("errName"), f.name);
      if (!f.text.value.trim()) return setErr(f, t("errRequired"), f.text);
      setErr(f, "");
      window.open(waLink(`${lang === "en" ? "My review of Aube Café" : "Mon avis sur Aube Café"} (${f.rating.value}/5) — ${f.name.value.trim()} :\n${f.text.value.trim()}`), "_blank", "noopener");
      toast(t("reviewSent"));
      f.reset();
    });
    observeReveal(box);
  }

  // ============================================================
  //  Formulaires devis / contact / newsletter
  // ============================================================
  function showSent(form) {
    const s = form.querySelector(".sent");
    s.hidden = false;
    setTimeout(() => { s.hidden = true; form.reset(); }, 6000);
  }
  function initForms() {
    const qc = $("#quote-coffee");
    if (qc) {
    const fillQuote = () => { const v = qc.value; qc.innerHTML = `<option value="">${lang === "en" ? "Let us advise you" : "Laissez-nous vous conseiller"}</option>` + cfg.products.map((p) => `<option>${esc(p.name)}</option>`).join(""); qc.value = v; };
    fillQuote();
    document.addEventListener("aube:lang", fillQuote);

    }
    if (has("#quote-form")) $("#quote-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      for (const n of ["lastname", "firstname"]) if (!f[n].value.trim()) return setErr(f, t("errName"), f[n]);
      if (!phoneOk(f.phone.value)) return setErr(f, t("errPhone"), f.phone);
      if (!emailOk(f.email.value.trim())) return setErr(f, t("errEmail"), f.email);
      if (!f.city.value.trim()) return setErr(f, t("errRequired"), f.city);
      if (!f.qty.value) return setErr(f, t("errRequired"), f.qty);
      setErr(f, "");
      const fr = lang !== "en";
      const lines = [
        fr ? "Bonjour Aube Café, je souhaite recevoir un devis." : "Hello Aube Café, I'd like a quote.",
        "",
        `${fr ? "Nom" : "Name"} : ${f.firstname.value.trim()} ${f.lastname.value.trim()}`,
        `${fr ? "Téléphone" : "Phone"} : ${f.phone.value.trim()}`,
        f.email.value.trim() && `E-mail : ${f.email.value.trim()}`,
        f.company.value.trim() && `${fr ? "Entreprise" : "Company"} : ${f.company.value.trim()}`,
        `${fr ? "Ville" : "City"} : ${f.city.value.trim()}`,
        `${fr ? "Quantité" : "Quantity"} : ${f.qty.value}`,
        f.coffee.value && `${fr ? "Café" : "Coffee"} : ${f.coffee.value}`,
        f.budget.value && `Budget : ${f.budget.value}`,
        f.message.value.trim() && `\n${f.message.value.trim()}`
      ].filter(Boolean).join("\n");
      window.open(waLink(lines), "_blank", "noopener");
      showSent(f);
    });

    if (has("#contact-form")) $("#contact-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.name.value.trim()) return setErr(f, t("errName"), f.name);
      if (!phoneOk(f.phone.value)) return setErr(f, t("errPhone"), f.phone);
      if (!emailOk(f.email.value.trim())) return setErr(f, t("errEmail"), f.email);
      if (!f.message.value.trim()) return setErr(f, t("errRequired"), f.message);
      if (!f.consent.checked) return setErr(f, t("errConsent"), f.consent);
      setErr(f, "");
      const fr = lang !== "en";
      const head = [`${fr ? "Sujet" : "Subject"} : ${f.subject.value}`, `${fr ? "Nom" : "Name"} : ${f.name.value.trim()}`, `${fr ? "Téléphone" : "Phone"} : ${f.phone.value.trim()}`, f.email.value.trim() && `E-mail : ${f.email.value.trim()}`].filter(Boolean);
      window.open(waLink(head.join("\n") + "\n\n" + f.message.value.trim()), "_blank", "noopener");
      showSent(f);
    });

    $("#newsletter").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const v = f.email.value.trim();
      if (!v || !emailOk(v)) { f.email.focus(); toast(t("nlBad")); return; }
      window.location.href = `mailto:${cfg.email}?subject=${encodeURIComponent("Inscription à la lettre Aube Café")}&body=${encodeURIComponent((lang === "en" ? "Please subscribe me: " : "Merci de m'inscrire : ") + v)}`;
      f.querySelector(".newsletter__ok").hidden = false;
      f.reset();
    });
  }

  // ============================================================
  //  Adresses + carte
  // ============================================================
  let locTab = "all", locSel = 0;
  const mapSrc = (l) => `https://www.google.com/maps?q=${l.lat},${l.lng}&z=15&output=embed`;
  function renderLocations() {
    if (!has("#loc-list")) return;
    const tabs = ["all", "siege", "boutique", "relais"];
    $("#loc-tabs").innerHTML = tabs.map((k) => `<button type="button" class="tab" role="tab" data-ltab="${k}" aria-selected="${k === locTab}">${t(k)}</button>`).join("");
    const list = cfg.locations.map((l, i) => ({ l, i })).filter(({ l }) => locTab === "all" || l.type === locTab);
    if (!list.some(({ i }) => i === locSel) && list.length) locSel = list[0].i;
    $("#loc-list").innerHTML = list.map(({ l, i }) => `<li><div class="loc${i === locSel ? " is-sel" : ""}" data-loc="${i}">
      <span class="loc__pin"><svg class="ic"><use href="#i-pin"/></svg></span>
      <span class="loc__type">${t("t_" + l.type)}</span>
      <strong>${esc(l.name)}</strong>
      <small>${esc(l.address)} · ${esc(l.hours)}</small>
      <span class="loc__actions"><button type="button" class="loc__route" data-pick="${i}" aria-pressed="${i === locSel}"><svg class="ic"><use href="#i-pin"/></svg>${t("seeMap")}</button>
      <a class="loc__route" href="https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}" target="_blank" rel="noopener"><svg class="ic"><use href="#i-route"/></svg>${t("route")}</a></span>
    </div></li>`).join("");
    const map = $("#map");
    const src = mapSrc(cfg.locations[locSel]);
    if (map.dataset.src !== src) { map.dataset.src = src; if (map.dataset.ready) map.src = src; }
  }
  function initLocations() {
    if (!has("#loc-list")) return;
    renderLocations();
    $("#loc-tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-ltab]"); if (b) { locTab = b.dataset.ltab; renderLocations(); } });
    const pick = (el) => { if (!el) return; locSel = +el.dataset.loc; renderLocations(); };
    $("#loc-list").addEventListener("click", (e) => { if (e.target.closest("a")) return; pick(e.target.closest("[data-loc]")); });
    // La carte ne se charge qu'à l'approche de la section (performances)
    const map = $("#map");
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { map.dataset.ready = "1"; map.src = map.dataset.src; io.disconnect(); } }, { rootMargin: "400px" });
    io.observe(map);
  }

  // ============================================================
  //  Blog
  // ============================================================
  function renderPosts() {
    const box = $("#posts");
    if (!box) return;
    const limit = +box.dataset.limit || I.posts.length;
    box.innerHTML = I.posts.slice(0, limit).map((p, i) => `<button type="button" class="post reveal" style="--d:${i * 90}ms" data-post="${p.id}"><div class="post__img"><img src="${p.image}" alt="" width="960" height="600" loading="lazy"></div><small>${t("minRead", { n: p.min })}</small><h3>${esc(tr(p.title))}</h3><p>${esc(tr(p.excerpt))}</p><span class="link">${t("readMore")} →</span></button>`).join("");
    observeReveal($("#posts"));
  }
  function openPost(id) {
    const p = I.posts.find((x) => x.id === id);
    if (!p) return;
    $("#article-body").innerHTML = closeBtn() + `<article class="article"><div class="article__img"><img src="${p.image.replace("-sm", "")}" alt="" width="1920" height="840"></div><div class="article__body"><p class="eyebrow">${t("minRead", { n: p.min })}</p><h2>${esc(tr(p.title))}</h2>${tr(p.body)}<p><a href="${SHOP}" class="btn btn--dark">${t("viewCoffees")}</a></p></div></article>`;
    showModal("article-modal");
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-post]"); if (b) openPost(b.dataset.post); });

  // ============================================================
  //  Service client : statut, horaires, FAQ
  // ============================================================
  function abidjanNow() { const d = new Date(); return { day: d.getUTCDay(), h: d.getUTCHours() + d.getUTCMinutes() / 60 }; } // Abidjan = UTC+0
  function isOpen() { const { day, h } = abidjanNow(); const s = cfg.support[day]; return !!s && h >= s[0] && h < s[1]; }
  function renderStatus() {
    const open = isOpen();
    let text = t("open");
    if (!open) {
      const { day, h } = abidjanNow();
      let d = day, add = 0;
      if (cfg.support[day] && h < cfg.support[day][0]) add = 0; else { d = (day + 1) % 7; add = 1; }
      while (!cfg.support[d] && add < 7) { d = (d + 1) % 7; add++; }
      const name = add === 0 ? t("today") : add === 1 ? t("tomorrow") : I.dyn.days[L()][d];
      text = t("closed", { d: name, h: cfg.support[d][0] });
    }
    $$("[data-status]").forEach((el) => { el.classList.toggle("is-open", open); el.querySelector(".live__text").textContent = text; });
    $$("[data-online-dot]").forEach((el) => el.classList.toggle("is-open", open));
    const day = abidjanNow().day;
    const idx = day === 0 ? 2 : day === 6 ? 1 : 0;
    $$(".js-hours").forEach((ul) => (ul.innerHTML = cfg.hours.map((h, i) => `<li class="${i === idx ? "is-today" : ""}"><span>${esc(h[lang] || h.fr)}</span><span>${esc(h.h)}</span></li>`).join("")));
  }
  let faqCat = "all", faqQ = "";
  function renderFaq() {
    if (!has("#faq-list")) return;
    const cats = Array.from(new Set(I.faq.map((f) => f.cat[0])));
    $("#faq-tabs").innerHTML = [`<button type="button" class="tab" role="tab" data-fcat="all" aria-selected="${faqCat === "all"}">${t("all")}</button>`].concat(cats.map((c) => { const f = I.faq.find((x) => x.cat[0] === c); return `<button type="button" class="tab" role="tab" data-fcat="${esc(c)}" aria-selected="${faqCat === c}">${esc(tr(f.cat))}</button>`; })).join("");
    const q = norm(faqQ);
    const list = I.faq.filter((f) => (faqCat === "all" || f.cat[0] === faqCat) && (!q || norm(f.q.join(" ") + " " + f.a.join(" ")).includes(q)));
    $("#faq-list").innerHTML = list.length ? list.map((f) => `<details><summary>${esc(tr(f.q))}</summary><p>${esc(tr(f.a))}</p></details>`).join("") : `<p class="muted">${esc(t("noResult", { q: faqQ }))}</p>`;
  }
  function initHelp() {
    const tel = cfg.phoneDisplay.replace(/\s/g, "");
    $$(".js-tel").forEach((a) => (a.href = "tel:" + tel));
    $$(".js-mail").forEach((a) => (a.href = "mailto:" + cfg.email));
    $$(".js-phone").forEach((el) => (el.textContent = cfg.phoneDisplay));
    $$(".js-email").forEach((el) => (el.textContent = cfg.email));
    if (has("#faq-list")) {
    $("#faq-tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-fcat]"); if (b) { faqCat = b.dataset.fcat; renderFaq(); } });
    $("#faq-search").addEventListener("input", (e) => { faqQ = e.target.value; renderFaq(); });
    }
    renderStatus();
    setInterval(renderStatus, 60000);
  }
  function setWaLinks() {
    $$("[data-wa]").forEach((a) => (a.href = waLink(lang === "en" ? "Hello Aube Café, I need some help." : "Bonjour Aube Café, j'ai besoin d'aide.")));
  }

  // ============================================================
  //  Réseaux sociaux, logos de paiement
  // ============================================================
  function renderSocials() {
    const names = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", linkedin: "LinkedIn" };
    $("#socials").innerHTML = Object.keys(names).map((k) => {
      const url = cfg.socials[k];
      return `<a href="${url ? esc(url) : "#"}" ${url ? 'target="_blank" rel="noopener"' : 'data-soon'} aria-label="${names[k]}"><svg class="ic"><use href="#i-${k}"/></svg></a>`;
    }).join("");
    $("#socials").addEventListener("click", (e) => { if (e.target.closest("[data-soon]")) { e.preventDefault(); toast(t("socialSoon")); } });
  }
  function renderPayments() {
    const kind = { mobile: ["Mobile Money", "Mobile Money"], carte: ["Carte", "Card"], banque: ["Banque", "Bank"], especes: ["Livraison", "Delivery"] };
    if (has("#logos")) $("#logos").innerHTML = cfg.payments.map((p, i) => `<li class="logo-item reveal" style="--d:${i * 40}ms" title="${esc(p.name)}">${p.logo ? `<img src="${p.logo}" alt="${esc(p.name)}" width="120" height="60" loading="lazy">` : `<span class="wordmark" style="--c:${p.color || "#0e0b09"}">${esc(p.name)}<small>${esc(tr(kind[p.kind]))}</small></span>`}</li>`).join("");
    $("#footer-pay").innerHTML = cfg.payments.filter((p) => p.kind !== "banque").map((p) => `<li title="${esc(p.name)}">${p.logo ? `<img src="${p.logo}" alt="${esc(p.name)}" width="40" height="16" loading="lazy">` : esc(p.name.split(" ")[0])}</li>`).join("");
    if (has("#logos")) observeReveal($("#logos"));
  }

  // ============================================================
  //  Apparitions au défilement + parallaxe
  // ============================================================
  const revealIO = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); revealIO.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;
  function observeReveal(scope) {
    $$(".reveal:not(.is-visible), .head:not(.is-visible), .assist:not(.is-visible), .values:not(.is-visible), .help:not(.is-visible), .trust:not(.is-visible)", scope || document).forEach((el) => {
      if (revealIO) revealIO.observe(el); else el.classList.add("is-visible");
    });
  }
  function initReveal() {
    // Ajoute la classe .reveal aux blocs principaux
    $$(".stat, .about__copy > *, .split > div:first-child > *, .split > form, .help__card, .faq, .hours, .trust__item, .footer__top > *").forEach((el, i) => {
      el.classList.add("reveal");
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 4) * 80 + "ms");
    });
    $$(".anim-ic").forEach((el, i) => el.style.setProperty("--d", (i % 4) * 120 + "ms"));
    observeReveal();
    // Parallaxe douce
    const par = $$(".parallax");
    if (reduced || !par.length) return;
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      par.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const k = (r.top + r.height / 2 - vh / 2) * (+el.dataset.speed || 0.1);
        const img = el.querySelector("img");
        if (img) img.style.transform = `translate3d(0, ${(-k - r.height * 0.09).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  // ============================================================
  //  Thème + langue
  // ============================================================
  function initThemeLang() {
    $("#theme-btn").addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncLogo();
      document.dispatchEvent(new CustomEvent("aube:theme"));
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncLogo);
    $("#lang-btn").addEventListener("click", () => {
      lang = lang === "en" ? "fr" : "en";
      try { localStorage.setItem("lang", lang); } catch (e) {}
      renderAll();
      document.dispatchEvent(new CustomEvent("aube:lang"));
    });
  }

  // ============================================================
  //  Données structurées (SEO)
  // ============================================================
  function jsonLd() {
    const el = $("#ld-business");
    if (!el) return;
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Store", "@id": cfg.url + "/#store", name: cfg.brand, url: cfg.url + "/", image: cfg.url + "/images/partage.png", logo: cfg.url + "/images/logo.svg",
          telephone: cfg.phoneDisplay, email: cfg.email, priceRange: "3500–22000 XOF", currenciesAccepted: "XOF",
          paymentAccepted: cfg.payments.map((p) => p.name).join(", "),
          address: { "@type": "PostalAddress", streetAddress: cfg.locations[0].address, addressLocality: "Abidjan", addressCountry: "CI" },
          geo: { "@type": "GeoCoordinates", latitude: cfg.locations[0].lat, longitude: cfg.locations[0].lng },
          openingHoursSpecification: [
            { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "20:00" },
            { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "19:00" },
            { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "09:00", closes: "14:00" }
          ],
          sameAs: Object.values(cfg.socials).filter(Boolean)
        },
        ...cfg.products.map((p) => ({
          "@type": "Product", name: p.name, image: cfg.url + "/" + p.image, description: p.story.fr, brand: { "@type": "Brand", name: cfg.brand },
          countryOfOrigin: p.country,
          offers: { "@type": "Offer", price: priceOf(p), priceCurrency: "XOF", availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@id": cfg.url + "/#store" } }
        }))
      ]
    };
    el.textContent = JSON.stringify(data);
  }

  // ============================================================
  //  Rendu global
  // ============================================================
  function renderAll() {
    applyLang();
    renderPromo();
    renderMega();
    renderNotifs();
    renderHero();
    renderGrid();
    renderContinents();
    renderRails();
    renderFilters();
    renderOrigins();
    renderReviews();
    renderPosts();
    renderLocations();
    renderFaq();
    renderStatus();
    renderPayments();
    renderWish();
    fillCommunes();
    renderCart();
    renderCompareBar();
    setWaLinks();
    if (openDrawer && openDrawer.id === "account") renderAccount();
  }

  function init() {
    $("#year").textContent = new Date().getFullYear();
    syncLogo();
    initThemeLang();
    initNav();
    initDrawers();
    initSearch();
    initFilters();
    initCart();
    initForms();
    initLocations();
    initHelp();
    renderSocials();
    renderAll();
    initHero();
    initCounters();
    initReveal();
    jsonLd();
    $("#compare-open").addEventListener("click", openCompare);
    $("#compare-clear").addEventListener("click", () => { const ids = compare.slice(); compare = []; ids.forEach((id) => $$(`[data-compare="${id}"]`).forEach((b) => { b.classList.remove("is-on"); b.setAttribute("aria-pressed", "false"); })); renderCompareBar(); });
    setInterval(rotatePromo, 4500);
    setInterval(tickOffer, 1000);
    // Sonnerie de la cloche s'il y a des nouveautés non lues
    setTimeout(() => { if (!$("#notif-count").hidden) $("#notif-btn").classList.add("is-ring"); }, 2600);
    // Lien profond : #produit-<id>
    const m = location.hash.match(/^#produit-(.+)$/);
    if (m && byId(m[1])) openProduct(m[1]);
    const a = location.hash.match(/^#article-(.+)$/);
    if (a) openPost(a[1]);
  }

  // API partagée avec effects.js (roue, assistant)
  window.Aube = {
    t, tr, esc, money, lang: () => lang, byId, priceOf, openProduct, addToCart, waLink, toast, isOpen, showModal, closeBtn,
    applyCode(code) { appliedCode = code; store.set("code", code); account.code = code; store.set("account", account); const i = $("#promo-code"); if (i) i.value = code; renderTotals(); },
    showCart: () => showDrawer("cart"),
    store
  };

  init();
})();
