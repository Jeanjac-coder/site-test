(function () {
  "use strict";

  const cfg = window.SITE_CONFIG;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const money = new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency });
  const fmt = (n) => money.format(n);
  const waLink = (text) => "https://wa.me/" + cfg.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  const telLink = "tel:" + cfg.shop.phoneDisplay.replace(/\s/g, "");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Recherche insensible aux accents et à la casse
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        /* stockage indisponible */
      }
    }
  };
  const icon = (id, cls = "") => `<svg class="ic ${cls}"><use href="#i-${id}"/></svg>`;

  /* ---------- Petit message de confirmation ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }

  /* ============================================================
     Contenu issu de la configuration
     ============================================================ */
  const imgs = cfg.images || {};
  $$("[data-brand]").forEach((el) => (el.textContent = cfg.brand));
  $$("img[data-img]").forEach((img) => {
    const src = imgs[img.dataset.img];
    if (src) img.src = src;
    if (img.dataset.img === "logo") img.alt = cfg.brand;
  });
  $("#year").textContent = new Date().getFullYear();
  $$("[data-count-products]").forEach((el) => (el.textContent = cfg.products.length));
  $$("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));

  $("#shop-address").textContent = cfg.shop.address;
  $("#shop-phone").textContent = cfg.shop.phoneDisplay;
  $("#shop-phone").href = telLink;
  $("#shop-hours").innerHTML = cfg.shop.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`).join("");
  $("#maps-link").href = $("#map-fallback").href =
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(cfg.shop.lat + "," + cfg.shop.lng);
  const { lat, lng } = cfg.shop;
  $("#map").src =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    [lng - 0.012, lat - 0.008, lng + 0.012, lat + 0.008].join(",") +
    "&layer=mapnik&marker=" + lat + "," + lng;

  $("#support-phone").textContent = cfg.shop.phoneDisplay;
  $("#support-email").textContent = cfg.email;
  $("#support-call").href = $("#helpdesk-call").href = telLink;
  $("#support-mail").href = $("#helpdesk-mail").href = "mailto:" + cfg.email;
  $("#footer-address").textContent = cfg.shop.address;
  $("#footer-phone").textContent = cfg.shop.phoneDisplay;
  $("#footer-phone").href = telLink;
  $("#footer-email").textContent = cfg.email;
  $("#footer-email").href = "mailto:" + cfg.email;

  // Moyens de paiement
  const initials = (n) => n.replace(/[^A-Za-zÀ-ÿ ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  $("#pay-list").innerHTML = cfg.payments
    .map(
      (p) => `<li class="pay__item">
        <span class="pay__logo" style="background:${esc(p.color)};color:${esc(p.ink)}">${esc(initials(p.name))}</span>
        <span><strong>${esc(p.name)}</strong>${p.note ? `<small>${esc(p.note)}</small>` : ""}</span>
      </li>`
    )
    .join("");
  $("#footer-pay").innerHTML = cfg.payments.map((p) => `<li>${esc(p.name)}</li>`).join("");
  $("#order-pay").innerHTML = cfg.payments
    .map(
      (p, i) => `<label><input type="radio" name="payment" value="${esc(p.name)}"${i === 0 ? " checked" : ""}>
        <span><i style="background:${esc(p.color)}"></i>${esc(p.name)}</span></label>`
    )
    .join("");

  // Zones de livraison
  const zones = cfg.delivery.zones;
  $$("select[data-zones]").forEach((sel) => {
    const withFee = sel.hasAttribute("data-with-fee");
    sel.innerHTML =
      `<option value="">Choisir votre commune</option>` +
      zones.map((z) => `<option value="${esc(z.name)}">${esc(z.name)}${withFee ? " — " + fmt(z.fee) : ""}</option>`).join("") +
      `<option value="autre">Autre ville (frais à confirmer)</option>`;
  });
  $("#zones-list").innerHTML = zones.map((z) => `<li>${esc(z.name)} <b>${fmt(z.fee)}</b></li>`).join("");
  $("#zones-note").textContent =
    "Délai : " + cfg.delivery.delay + "." +
    (cfg.delivery.freeFrom != null ? " Livraison offerte dès " + fmt(cfg.delivery.freeFrom) + " d'achat." : "") +
    " Intérieur du pays : sur devis.";

  /* ============================================================
     Mode clair / sombre
     ============================================================ */
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches);
  function syncTheme() {
    const dark = isDark();
    $$('img[data-img="logo"]').forEach((img) => {
      const src = dark && imgs.logoSombre ? imgs.logoSombre : imgs.logo;
      if (src && img.getAttribute("src") !== src) img.src = src;
    });
    const btn = $("#theme-toggle");
    btn.setAttribute("aria-label", dark ? "Passer en mode clair" : "Passer en mode sombre");
    btn.title = btn.getAttribute("aria-label");
  }
  $("#theme-toggle").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.classList.add("theme-anim");
    root.dataset.theme = next;
    try {
      if ((next === "dark") === systemDark.matches) {
        localStorage.removeItem("theme");
        delete root.dataset.theme;
      } else localStorage.setItem("theme", next);
    } catch (e) {
      /* choix valable pour cette visite */
    }
    syncTheme();
    setTimeout(() => root.classList.remove("theme-anim"), 450);
  });
  systemDark.addEventListener("change", syncTheme);
  syncTheme();

  /* ============================================================
     Ouvert / fermé (heure d'Abidjan = GMT, sans heure d'été)
     ============================================================ */
  const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function openStatus() {
    const now = new Date();
    const day = now.getUTCDay();
    const h = now.getUTCHours() + now.getUTCMinutes() / 60;
    const today = cfg.shop.support[day];
    if (today && h >= today[0] && h < today[1]) {
      return { open: true, text: `En ligne · nous répondons jusqu'à ${today[1]} h` };
    }
    // Prochaine ouverture
    for (let i = 0; i < 7; i++) {
      const d = (day + i) % 7;
      const slot = cfg.shop.support[d];
      if (!slot) continue;
      if (i === 0 && h < slot[0]) return { open: false, text: `Fermé · réouverture aujourd'hui à ${slot[0]} h` };
      if (i === 1) return { open: false, text: `Fermé · réouverture demain à ${slot[0]} h` };
      if (i > 1) return { open: false, text: `Fermé · réouverture ${DAYS[d]} à ${slot[0]} h` };
    }
    return { open: false, text: "Fermé pour le moment" };
  }
  function syncStatus() {
    const s = openStatus();
    $$("[data-status]").forEach((el) => {
      el.classList.toggle("is-open", s.open);
      $(".status__text", el).textContent = s.text;
    });
    $$("[data-online-dot]").forEach((el) => el.classList.toggle("is-open", s.open));
  }
  syncStatus();
  setInterval(syncStatus, 60000);

  /* ============================================================
     Tiroirs (menu, panier) et superpositions
     ============================================================ */
  const overlay = $("#overlay");
  let openDrawer = null;
  let lastFocus = null;
  $$(".drawer").forEach((d) => (d.inert = true));

  function showDrawer(drawer, trigger) {
    if (openDrawer) hideDrawer(false);
    lastFocus = trigger || document.activeElement;
    openDrawer = drawer;
    drawer.inert = false;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.classList.add("is-locked");
    $$(`[aria-controls="${drawer.id}"]`).forEach((b) => b.setAttribute("aria-expanded", "true"));
    setTimeout(() => {
      const f = drawer.querySelector("button, a[href], input, select");
      if (f) f.focus({ preventScroll: true });
    }, 60);
  }
  function hideDrawer(restore = true) {
    if (!openDrawer) return;
    const d = openDrawer;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    d.inert = true;
    $$(`[aria-controls="${d.id}"]`).forEach((b) => b.setAttribute("aria-expanded", "false"));
    openDrawer = null;
    overlay.hidden = true;
    document.body.classList.remove("is-locked");
    if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  overlay.addEventListener("click", () => hideDrawer());
  $$(".drawer [data-close]").forEach((b) => b.addEventListener("click", () => hideDrawer(b.tagName !== "A")));
  $$(".menu__links a").forEach((a) => a.addEventListener("click", () => hideDrawer(false)));
  $("#burger").addEventListener("click", (e) => showDrawer($("#menu"), e.currentTarget));
  $("#cart-btn").addEventListener("click", (e) => showDrawer($("#cart"), e.currentTarget));
  $("#cart-bar").addEventListener("click", (e) => showDrawer($("#cart"), e.currentTarget));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("#search-results").hidden) return closeResults();
    if (!$("#notif-panel").hidden) return toggleNotif(false);
    if (!$("#helpdesk-panel").hidden) return toggleHelpdesk(false);
    if ($("#nav").classList.contains("is-searching")) return closeMobileSearch();
    hideDrawer();
  });

  /* ============================================================
     Notifications
     ============================================================ */
  const notifs = cfg.notifications || [];
  let readIds = store.get("notifs-read", []);
  function renderNotifs() {
    const unread = notifs.filter((n) => !readIds.includes(n.id)).length;
    $("#notif-list").innerHTML = notifs.length
      ? notifs
          .map(
            (n) => `<li class="${readIds.includes(n.id) ? "" : "is-unread"}"><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p></li>`
          )
          .join("")
      : `<li><p>Aucune notification pour le moment.</p></li>`;
    const c = $("#notif-count");
    c.textContent = unread;
    c.hidden = unread === 0;
    $("#notif-btn").setAttribute("aria-label", unread ? `Notifications (${unread} non lues)` : "Notifications");
    return unread;
  }
  function toggleNotif(force) {
    const panel = $("#notif-panel");
    const open = force ?? panel.hidden;
    panel.hidden = !open;
    $("#notif-btn").setAttribute("aria-expanded", String(open));
    if (open) {
      setTimeout(() => {
        readIds = notifs.map((n) => n.id);
        store.set("notifs-read", readIds);
        const c = $("#notif-count");
        c.hidden = true;
      }, 1200);
    } else renderNotifs();
  }
  if (renderNotifs() && !reduceMotion.matches) {
    setTimeout(() => $("#notif-btn").classList.add("is-ringing"), 1500);
  }
  $("#notif-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNotif();
  });
  $("#notif-read").addEventListener("click", () => {
    readIds = notifs.map((n) => n.id);
    store.set("notifs-read", readIds);
    renderNotifs();
  });

  /* ============================================================
     Catalogue : catégories, recherche, cartes produits
     ============================================================ */
  const products = cfg.products;
  const byId = (id) => products.find((p) => p.id === id);
  const catLabel = (id) => (cfg.categories.find((c) => c.id === id) || {}).label || "";
  let activeCat = "all";
  let query = "";

  // Texte indexé pour la recherche
  products.forEach((p) => {
    p._search = norm([p.name, p.origin, p.notes, p.roast, p.badge || "", ...(p.categories || []).map(catLabel)].join(" "));
  });

  const allCats = [{ id: "all", label: "Tous les cafés" }].concat(cfg.categories);
  const count = (id) => (id === "all" ? products.length : products.filter((p) => (p.categories || []).includes(id)).length);
  const chipHTML = (c) =>
    `<button type="button" class="chip" role="tab" data-cat="${esc(c.id)}" aria-selected="${c.id === activeCat}">${esc(c.label)} <small>${count(c.id)}</small></button>`;
  $("#cats").innerHTML = allCats.map(chipHTML).join("");
  $("#menu-cats").innerHTML = allCats.map(chipHTML).join("");

  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat]");
    if (!chip) return;
    setCategory(chip.dataset.cat, true);
    hideDrawer(false);
  });

  function setCategory(id, scroll) {
    activeCat = id;
    $$("[data-cat]").forEach((c) => c.setAttribute("aria-selected", String(c.dataset.cat === id)));
    applyFilters();
    if (scroll) scrollToCatalogue();
  }
  function scrollToCatalogue() {
    const top = $("#cafes").getBoundingClientRect().top;
    if (top > 200 || top < -$("#cafes").offsetHeight + 400) $("#cafes").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  $("#products").innerHTML = products
    .map((p) => {
      const beans = Array.from({ length: 5 }, (_, i) => `<i class="${i < p.intensity ? "on" : ""}"></i>`).join("");
      return `
      <article class="product" data-id="${esc(p.id)}">
        <div class="product__visual">
          ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ""}
          <img src="${esc(p.image)}" alt="${esc(p.name)}" width="400" height="400" loading="lazy">
        </div>
        <div class="product__body">
          <p class="product__origin">${icon("pin")}${esc(p.origin)}</p>
          <h3>${esc(p.name)}</h3>
          <p class="product__notes">${esc(p.notes)}</p>
          <div class="intensity" aria-label="Intensité ${p.intensity} sur 5"><span>Intensité</span><span class="beans">${beans}</span></div>
          <div class="product__foot">
            <p class="price">${fmt(p.price)}<small>${esc(p.size)} · ${esc(p.roast.replace("Torréfaction ", "torréf. "))}</small></p>
            <button type="button" class="add" data-add="${esc(p.id)}" aria-label="Ajouter ${esc(p.name)} au panier">
              ${icon("plus", "ic-plus")}${icon("check", "ic-check")}
            </button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  function matches(p) {
    const inCat = activeCat === "all" || (p.categories || []).includes(activeCat);
    if (!inCat) return false;
    if (!query) return true;
    return norm(query).split(/\s+/).every((w) => p._search.includes(w));
  }
  function applyFilters() {
    let n = 0;
    $$(".product").forEach((card) => {
      const ok = matches(byId(card.dataset.id));
      if (ok) n++;
      if (ok && card.hidden && !reduceMotion.matches) {
        card.hidden = false;
        card.classList.add("is-visible");
        card.animate([{ opacity: 0, transform: "translateY(16px) scale(.97)" }, { opacity: 1, transform: "none" }], {
          duration: 450,
          easing: "cubic-bezier(.2,.7,.2,1)"
        });
      }
      card.hidden = !ok;
    });
    $("#empty").hidden = n > 0;
    const catTxt = activeCat === "all" ? "" : " · " + catLabel(activeCat);
    $("#result-count").textContent = `${n} café${n > 1 ? "s" : ""}${catTxt}${query ? ` · « ${query} »` : ""}`;
  }
  $("#reset-filters").addEventListener("click", () => {
    query = "";
    $("#search-input").value = "";
    setCategory("all", false);
  });
  applyFilters();

  /* ---------- Recherche avec suggestions ---------- */
  const input = $("#search-input");
  const results = $("#search-results");
  let sel = -1;
  function closeResults() {
    results.hidden = true;
    input.setAttribute("aria-expanded", "false");
    sel = -1;
  }
  function renderResults() {
    const q = input.value.trim();
    if (!q) return closeResults();
    const list = products.filter((p) => norm(q).split(/\s+/).every((w) => p._search.includes(w))).slice(0, 6);
    results.innerHTML = list.length
      ? list
          .map(
            (p, i) => `<button type="button" class="search__item" role="option" data-go="${esc(p.id)}" aria-selected="${i === sel}">
            <img src="${esc(p.image)}" alt="" width="44" height="44"><span><strong>${esc(p.name)}</strong><small>${esc(p.notes)}</small></span><em>${fmt(p.price)}</em></button>`
          )
          .join("")
      : `<p class="search__none">Aucun café pour « ${esc(q)} ». Essayez « Kenya », « chocolat » ou « doux ».</p>`;
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  input.addEventListener("input", () => {
    query = input.value.trim();
    sel = -1;
    renderResults();
    applyFilters();
  });
  input.addEventListener("focus", renderResults);
  input.addEventListener("keydown", (e) => {
    const items = $$(".search__item", results);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.setAttribute("aria-selected", String(i === sel)));
    }
  });
  $("#search").addEventListener("submit", (e) => {
    e.preventDefault();
    const items = $$(".search__item", results);
    if (sel >= 0 && items[sel]) return goToProduct(items[sel].dataset.go);
    closeResults();
    input.blur();
    closeMobileSearch(true);
    $("#cafes").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
  });
  results.addEventListener("click", (e) => {
    const it = e.target.closest("[data-go]");
    if (it) goToProduct(it.dataset.go);
  });
  function goToProduct(id) {
    closeResults();
    query = "";
    input.value = "";
    closeMobileSearch(true);
    setCategory("all", false);
    const card = $(`.product[data-id="${CSS.escape(id)}"]`);
    card.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
    card.classList.remove("is-hit");
    void card.offsetWidth;
    card.classList.add("is-hit");
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#search")) closeResults();
    if (!e.target.closest(".notif")) toggleNotif(false);
  });
  // Recherche plein largeur sur mobile
  function closeMobileSearch(keepQuery) {
    $("#nav").classList.remove("is-searching");
    if (!keepQuery && window.innerWidth < 900) {
      input.value = "";
      query = "";
      applyFilters();
    }
  }
  $("#search-toggle").addEventListener("click", () => {
    $("#nav").classList.add("is-searching");
    input.focus();
  });
  $("#search-close").addEventListener("click", () => {
    closeResults();
    closeMobileSearch();
  });

  /* ---------- Bandeau défilant ---------- */
  const words = products.map((p) => p.name).concat(["Livraison 24 h à Abidjan", "Akwaba !"]);
  const run = words.map((w) => `<span>${esc(w)}</span>`).join("");
  $("#marquee").innerHTML = run + run;

  /* ============================================================
     Diaporama du haut de page
     ============================================================ */
  const slides = cfg.slides || [];
  const hero = $("#hero");
  const delay = cfg.slideDelay || 6000;
  hero.style.setProperty("--delay", delay + "ms");
  $("#slides").innerHTML = slides
    .map(
      (s, i) => `
    <div class="slide${i === 0 ? " is-active" : ""}" role="group" aria-roledescription="diapositive" aria-label="${i + 1} sur ${slides.length}" ${i ? 'aria-hidden="true"' : ""}>
      <div class="slide__text">
        <p class="slide__eyebrow">${esc(s.eyebrow)}</p>
        ${i === 0 ? `<h1>${esc(s.title)}</h1>` : `<h2>${esc(s.title)}</h2>`}
        <p>${esc(s.text)}</p>
        <div class="slide__actions">
          <a href="${esc(s.href)}" class="btn btn--light">${esc(s.cta)} ${icon("right")}</a>
          <a data-wa="Bonjour Aube Café !" href="${waLink("Bonjour Aube Café !")}" class="btn btn--outline-light" target="_blank" rel="noopener">${icon("wa")} WhatsApp</a>
        </div>
      </div>
      <div class="slide__visual"><img src="${esc(s.image)}" alt="" width="500" height="500" ${i ? 'loading="lazy"' : ""}></div>
    </div>`
    )
    .join("");
  $("#dots").innerHTML = slides
    .map((s, i) => `<button type="button" class="dot" role="tab" aria-label="Diapositive ${i + 1} : ${esc(s.eyebrow)}" aria-selected="${i === 0}"></button>`)
    .join("");

  const slideEls = $$(".slide", hero);
  const dotEls = $$(".dot", hero);
  let current = 0;
  let timer = null;
  let paused = reduceMotion.matches; // pas de défilement automatique si moins d'animations est demandé
  let hovering = false;

  function go(i) {
    const next = (i + slides.length) % slides.length;
    if (next === current) return;
    const prev = slideEls[current];
    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");
    prev.setAttribute("aria-hidden", "true");
    setTimeout(() => prev.classList.remove("is-leaving"), 500);
    slideEls[next].classList.add("is-active");
    slideEls[next].removeAttribute("aria-hidden");
    dotEls.forEach((d, k) => {
      d.setAttribute("aria-selected", String(k === next));
      d.classList.toggle("is-done", k < next);
    });
    current = next;
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    // relance la barre de progression du point actif
    const d = dotEls[current];
    d.style.animation = "none";
    void d.offsetWidth;
    d.style.animation = "";
    if (!paused && !hovering && !document.hidden) timer = setTimeout(() => go(current + 1), delay);
  }
  function setPaused(p) {
    paused = p;
    hero.classList.toggle("is-paused", p);
    const b = $("#slide-pause");
    b.innerHTML = icon(p ? "play" : "pause");
    b.setAttribute("aria-label", p ? "Relancer le diaporama" : "Mettre le diaporama en pause");
    if (p) clearTimeout(timer);
    else schedule();
  }
  $("#slide-next").addEventListener("click", () => go(current + 1));
  $("#slide-prev").addEventListener("click", () => go(current - 1));
  $("#slide-pause").addEventListener("click", () => setPaused(!paused));
  dotEls.forEach((d, i) => d.addEventListener("click", () => go(i)));
  hero.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = true;
    hero.classList.add("is-paused");
    clearTimeout(timer);
  });
  hero.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = false;
    if (!paused) {
      hero.classList.remove("is-paused");
      timer = setTimeout(() => go(current + 1), delay / 2);
    }
  });
  hero.addEventListener("focusin", () => {
    hovering = true;
    clearTimeout(timer);
  });
  hero.addEventListener("focusout", () => {
    hovering = false;
    if (!paused) schedule();
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? clearTimeout(timer) : schedule()));
  // Glisser du doigt
  let startX = null;
  $("#slides").addEventListener("pointerdown", (e) => (startX = e.clientX));
  $("#slides").addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
  setPaused(paused);

  /* ============================================================
     Panier
     ============================================================ */
  // Une ligne = un café + une mouture. Clé : "id|mouture"
  let cart = store.get("cart-v2", {});
  Object.keys(cart).forEach((k) => {
    if (!byId(k.split("|")[0]) || !(cart[k] > 0)) delete cart[k];
  });
  const save = () => store.set("cart-v2", cart);
  const orderForm = $("#order-form");

  function lines() {
    return Object.entries(cart).map(([key, qty]) => {
      const [id, grind] = key.split("|");
      const p = byId(id);
      return { key, p, grind, qty, total: p.price * qty };
    });
  }
  function totals() {
    const sub = lines().reduce((s, l) => s + l.total, 0);
    const mode = orderForm.elements.mode.value;
    const commune = orderForm.elements.commune.value;
    const zone = zones.find((z) => z.name === commune);
    const free = cfg.delivery.freeFrom != null && sub >= cfg.delivery.freeFrom;
    let ship = 0;
    let shipLabel = "Gratuit";
    if (mode === "livraison" && sub > 0) {
      if (commune === "autre") shipLabel = "À confirmer";
      else if (!zone) shipLabel = "Selon la commune";
      else if (free) shipLabel = "Offerte 🎉";
      else {
        ship = zone.fee;
        shipLabel = fmt(ship);
      }
    }
    if (mode === "retrait") shipLabel = "Retrait gratuit";
    return { sub, ship, shipLabel, total: sub + ship, mode, commune, free };
  }

  function renderCart() {
    const ls = lines();
    const grindOpts = (g) => cfg.grinds.map((x) => `<option${x === g ? " selected" : ""}>${esc(x)}</option>`).join("");
    $("#cart-items").innerHTML = ls
      .map(
        (l) => `<li class="line" data-key="${esc(l.key)}">
        <img src="${esc(l.p.image)}" alt="" width="64" height="64">
        <div class="line__info"><strong>${esc(l.p.name)}</strong><span class="muted small">${esc(l.p.size)} · ${fmt(l.p.price)}</span><br>
          <select aria-label="Mouture pour ${esc(l.p.name)}" data-grind>${grindOpts(l.grind)}</select></div>
        <div class="line__right">
          <span class="line__price">${fmt(l.total)}</span>
          <span class="qty">
            <button type="button" data-act="dec" aria-label="${l.qty > 1 ? "Retirer un" : "Supprimer"}">${icon(l.qty > 1 ? "minus" : "trash")}</button>
            <span>${l.qty}</span>
            <button type="button" data-act="inc" aria-label="Ajouter un">${icon("plus")}</button>
          </span>
        </div></li>`
      )
      .join("");
    const empty = ls.length === 0;
    $("#cart-empty").hidden = !empty;
    orderForm.hidden = empty;

    const t = totals();
    $("#t-sub").textContent = fmt(t.sub);
    $("#t-ship").textContent = t.shipLabel;
    $("#t-total").textContent = fmt(t.total) + (t.mode === "livraison" && t.shipLabel !== "Offerte 🎉" && !t.ship && t.sub ? " + livraison" : "");
    let hint = "";
    if (t.mode === "livraison" && cfg.delivery.freeFrom != null && t.sub > 0) {
      hint = t.free ? "Livraison offerte sur votre commande 🎉" : `Plus que ${fmt(cfg.delivery.freeFrom - t.sub)} pour la livraison offerte.`;
    }
    $("#t-hint").textContent = hint;
    $("[data-delivery]", orderForm).hidden = t.mode !== "livraison";

    const n = ls.reduce((s, l) => s + l.qty, 0);
    const c = $("#cart-count");
    c.textContent = n;
    c.hidden = n === 0;
    $("#cart-btn").setAttribute("aria-label", n ? `Ouvrir le panier (${n} article${n > 1 ? "s" : ""})` : "Ouvrir le panier");
    $("#cart-bar").hidden = n === 0;
    $("#cart-bar-count").textContent = n + (n > 1 ? " articles" : " article");
    $("#cart-bar-total").textContent = fmt(t.total);
  }

  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // Grain de café qui vole du bouton jusqu'au panier
  function flyBean(from) {
    const target = window.innerWidth < 900 && !$("#cart-bar").hidden ? $("#cart-bar") : $("#cart-btn");
    if (reduceMotion.matches || !target.animate) return Promise.resolve();
    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const bean = document.createElement("span");
    bean.className = "flying-bean";
    document.body.appendChild(bean);
    const x0 = a.left + a.width / 2 - 9, y0 = a.top + a.height / 2 - 12;
    const x1 = b.left + b.width / 2 - 9, y1 = b.top + b.height / 2 - 12;
    const peak = Math.min(y0, y1) - 120;
    const anim = bean.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) rotate(0) scale(.6)`, opacity: 0 },
        { transform: `translate(${x0 + (x1 - x0) * 0.35}px, ${peak}px) rotate(260deg) scale(1.3)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x1}px, ${y1}px) rotate(540deg) scale(.5)`, opacity: 0.9 }
      ],
      { duration: 800, easing: "cubic-bezier(.45,.05,.4,1)" }
    );
    return anim.finished.then(() => bean.remove()).catch(() => bean.remove());
  }

  $("#products").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = byId(btn.dataset.add);
    const key = p.id + "|" + cfg.grinds[0];
    cart[key] = (cart[key] || 0) + 1;
    save();
    replay(btn, "is-added");
    setTimeout(() => btn.classList.remove("is-added"), 1400);
    flyBean(btn).then(() => {
      renderCart();
      replay($("#cart-btn"), "is-bump");
      replay($("#cart-count"), "is-pop");
      if (!$("#cart-bar").hidden) replay($("#cart-bar"), "is-bump");
    });
    if (reduceMotion.matches) renderCart();
    toast(`${p.name} ajouté au panier ☕`);
  });

  $("#cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const key = btn.closest(".line").dataset.key;
    cart[key] += btn.dataset.act === "inc" ? 1 : -1;
    if (cart[key] <= 0) delete cart[key];
    save();
    renderCart();
  });
  $("#cart-items").addEventListener("change", (e) => {
    if (!e.target.matches("[data-grind]")) return;
    const oldKey = e.target.closest(".line").dataset.key;
    const newKey = oldKey.split("|")[0] + "|" + e.target.value;
    cart[newKey] = (cart[newKey] || 0) + cart[oldKey];
    delete cart[oldKey];
    save();
    renderCart();
    const line = $(`.line[data-key="${CSS.escape(newKey)}"]`);
    if (line) replay(line, "is-flash");
  });
  orderForm.addEventListener("change", (e) => {
    if (e.target.name === "mode" || e.target.name === "commune") renderCart();
  });

  /* ---------- Validation commune aux formulaires ---------- */
  function check(form, rules) {
    $$(".is-invalid", form).forEach((f) => f.classList.remove("is-invalid"));
    for (const [name, msg, test] of rules) {
      const el = form.elements[name];
      const val = el.type === "checkbox" ? el.checked : el.value.trim();
      if (test ? !test(val) : !val) {
        const field = el.closest(".field");
        if (field) field.classList.add("is-invalid");
        $("[data-error]", form).textContent = msg;
        el.focus();
        return false;
      }
    }
    $("[data-error]", form).textContent = "";
    return true;
  }
  const phoneOk = (v) => !v || v.replace(/[^\d]/g, "").length >= 8;

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = orderForm.elements;
    const t = totals();
    const ls = lines();
    const rules = [["name", "Indiquez votre nom, s'il vous plaît."], ["phone", "Ce numéro de téléphone semble incomplet.", phoneOk]];
    if (t.mode === "livraison") {
      rules.push(["commune", "Choisissez votre commune de livraison."], ["address", "Indiquez votre adresse ou un repère."]);
    }
    if (!check(orderForm, rules)) return;
    const zone = t.commune === "autre" ? "Autre ville" : t.commune;
    const msg = [
      `Bonjour ${cfg.brand} ! Je souhaite passer commande :`,
      "",
      ...ls.map((l) => `• ${l.qty} × ${l.p.name} (${l.p.size}, ${l.grind}) = ${fmt(l.total)}`),
      "",
      `Sous-total : ${fmt(t.sub)}`,
      t.mode === "livraison" ? `Livraison (${zone}) : ${t.shipLabel.replace(" 🎉", "")}` : null,
      `*Total : ${fmt(t.total)}*`,
      "",
      `Nom : ${f.name.value.trim()}`,
      f.phone.value.trim() ? `Téléphone : ${f.phone.value.trim()}` : null,
      t.mode === "livraison" ? `Livraison à : ${zone}, ${f.address.value.trim()}` : "Retrait en boutique",
      `Paiement souhaité : ${f.payment.value}`,
      f.note.value.trim() ? `Remarque : ${f.note.value.trim()}` : null,
      "",
      "Merci beaucoup !"
    ]
      .filter((x) => x !== null)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener");
    toast("Votre commande est prête dans WhatsApp. Merci ! 🙏");
  });

  /* ============================================================
     Devis
     ============================================================ */
  const quote = $("#quote-form");
  $("#quote-cafes").innerHTML = products
    .map((p, i) => `<label><input type="checkbox" name="cafes" value="${esc(p.id)}"${i < 2 ? " checked" : ""}><span>${esc(p.name)}</span></label>`)
    .join("");
  const tiers = [[50, 0.2], [25, 0.15], [10, 0.1], [5, 0.05]];
  function grams(size) {
    const m = /([\d.,]+)\s*(kg|g)/i.exec(size);
    if (!m) return 250;
    const v = parseFloat(m[1].replace(",", "."));
    return m[2].toLowerCase() === "kg" ? v * 1000 : v;
  }
  function estimate() {
    const kg = +quote.elements.kg.value;
    $("#kg-out").textContent = kg + " kg";
    const ids = $$('input[name="cafes"]:checked', quote).map((c) => c.value);
    if (!ids.length) {
      $("#estimate").innerHTML = "";
      return null;
    }
    const perKg = ids.map((id) => {
      const p = byId(id);
      return (p.price / grams(p.size)) * 1000;
    });
    const avg = perKg.reduce((a, b) => a + b, 0) / perKg.length;
    const disc = (tiers.find(([min]) => kg >= min) || [0, 0])[1];
    const total = Math.round((avg * kg * (1 - disc)) / 500) * 500;
    $("#estimate").innerHTML = `<span>Estimation indicative${disc ? ` (remise de ${disc * 100} % incluse)` : ""}</span>
      <strong>≈ ${fmt(total)} / mois</strong><span>Le devis définitif vous est confirmé sous 24 h, hors livraison et équipement.</span>`;
    return { kg, ids, total, disc };
  }
  quote.addEventListener("input", estimate);
  estimate();
  quote.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = quote.elements;
    if (!check(quote, [["name", "Indiquez votre nom, s'il vous plaît."], ["phone", "Indiquez un numéro de téléphone valide.", (v) => v && phoneOk(v)]])) return;
    const est = estimate();
    const msg = [
      `Bonjour ${cfg.brand} ! *DEMANDE DE DEVIS*`,
      "",
      `Nom : ${f.name.value.trim()}`,
      f.company.value.trim() ? `Structure : ${f.company.value.trim()}` : null,
      `Téléphone : ${f.phone.value.trim()}`,
      f.commune.value ? `Commune : ${f.commune.value === "autre" ? "Autre ville" : f.commune.value}` : null,
      `Type de besoin : ${f.type.value}`,
      `Volume estimé : ${f.kg.value} kg par mois`,
      est ? `Cafés souhaités : ${est.ids.map((id) => byId(id).name).join(", ")}` : "Cafés souhaités : à conseiller",
      est ? `Estimation affichée sur le site : ≈ ${fmt(est.total)} / mois` : null,
      f.details.value.trim() ? `Précisions : ${f.details.value.trim()}` : null,
      "",
      "Merci de me faire parvenir votre proposition."
    ]
      .filter((x) => x !== null)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener");
    toast("Votre demande de devis est prête dans WhatsApp.");
  });

  /* ============================================================
     Formulaire de renseignements
     ============================================================ */
  const contact = $("#contact-form");
  contact.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = contact.elements;
    const viaMail = e.submitter && e.submitter.value === "mail";
    const ok = check(contact, [
      ["name", "Indiquez votre nom, s'il vous plaît."],
      ["phone", "Ce numéro de téléphone semble incomplet.", phoneOk],
      ["email", "Cette adresse e-mail semble incorrecte.", (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
      ["message", "Écrivez votre message, s'il vous plaît."],
      ["consent", "Merci d'accepter l'utilisation de vos informations pour que nous puissions vous répondre."]
    ]);
    if (!ok) return;
    const body = [
      `Nom : ${f.name.value.trim()}`,
      f.phone.value.trim() ? `Téléphone : ${f.phone.value.trim()}` : null,
      f.email.value.trim() ? `E-mail : ${f.email.value.trim()}` : null,
      `Sujet : ${f.subject.value}`,
      "",
      f.message.value.trim()
    ]
      .filter((x) => x !== null)
      .join("\n");
    if (viaMail) {
      window.location.href = `mailto:${cfg.email}?subject=${encodeURIComponent("[Site] " + f.subject.value)}&body=${encodeURIComponent(body)}`;
      toast("Votre messagerie s'ouvre avec le message prêt.");
    } else {
      window.open(waLink(`Bonjour ${cfg.brand} ! *DEMANDE DE RENSEIGNEMENT*\n\n${body}`), "_blank", "noopener");
      toast("Votre message est prêt dans WhatsApp.");
    }
  });

  /* ============================================================
     Service client flottant
     ============================================================ */
  const helpdesk = $("#helpdesk");
  function toggleHelpdesk(force) {
    const panel = $("#helpdesk-panel");
    const open = force ?? panel.hidden;
    panel.hidden = !open;
    helpdesk.classList.toggle("is-open", open);
    $("#helpdesk-btn").setAttribute("aria-expanded", String(open));
    $("#helpdesk-hint").hidden = true;
    if (open) setTimeout(() => $(".helpdesk__quick a", panel).focus({ preventScroll: true }), 50);
  }
  $("#helpdesk-btn").addEventListener("click", () => toggleHelpdesk());
  $("#helpdesk-close").addEventListener("click", () => toggleHelpdesk(false));
  $$("[data-helpdesk-close]").forEach((a) => a.addEventListener("click", () => toggleHelpdesk(false)));
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#helpdesk") && !$("#helpdesk-panel").hidden) toggleHelpdesk(false);
  });
  try {
    if (!sessionStorage.getItem("hint-seen")) {
      setTimeout(() => {
        if ($("#helpdesk-panel").hidden) {
          $("#helpdesk-hint").hidden = false;
          setTimeout(() => ($("#helpdesk-hint").hidden = true), 6000);
        }
        sessionStorage.setItem("hint-seen", "1");
      }, 5000);
    }
  } catch (e) {
    /* pas de stockage : pas d'info-bulle */
  }

  /* ============================================================
     En-tête, lien actif, apparitions, inclinaison des cartes
     ============================================================ */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    const links = $$(".nav__links a");
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["cafes", "devis", "boutique", "service"].forEach((id) => spy.observe(document.getElementById(id)));

    const groups = [
      ".section__head", ".hero__stats li", ".features > *", ".steps > *", ".pay > *", ".pay__item", ".quote > *",
      ".find > *", ".zones", ".support > *", ".faq details", ".contact > *", ".footer__grid > *", ".product"
    ];
    const targets = [];
    groups.forEach((s) =>
      $$(s).forEach((el, i) => {
        el.classList.add("reveal");
        el.style.setProperty("--delay", (s === ".product" ? i % 4 : Math.min(i, 5)) * 80 + "ms");
        targets.push(el);
      })
    );
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    targets.forEach((el) => io.observe(el));
    $$(".hl").forEach((h) => {
      if (!h.closest(".reveal")) {
        const o = new IntersectionObserver((en) => en[0].isIntersecting && (h.classList.add("is-drawn"), o.disconnect()));
        o.observe(h);
      }
    });
  } else {
    $$(".hl").forEach((h) => h.classList.add("is-drawn"));
  }

  // Inclinaison 3D des cartes produits au survol (souris uniquement)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
    $$(".product").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  renderCart();
})();
