(function () {
  "use strict";

  const cfg = window.SITE_CONFIG;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const money = new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency });
  const fmt = (n) => money.format(n);
  const round50 = (n) => Math.round(n / 50) * 50;
  const waLink = (text) => "https://wa.me/" + cfg.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  const telLink = "tel:" + cfg.shop.phoneDisplay.replace(/\s/g, "");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const isPhoto = (src) => !/\.svg$/i.test(src);
  const imgTag = (src, alt, size, extra = "") =>
    `<img src="${esc(src)}" alt="${esc(alt)}" width="${size}" height="${size}" loading="lazy"${isPhoto(src) ? ' class="is-photo"' : ""}${extra}>`;
  const icon = (id, cls = "") => `<svg class="ic ${cls}"><use href="#i-${id}"/></svg>`;
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

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }
  function replay(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ============================================================
     Produits, prix et offre de la semaine
     ============================================================ */
  const products = cfg.products;
  const byId = (id) => products.find((p) => p.id === id);
  const catLabel = (id) => (cfg.categories.find((c) => c.id === id) || {}).label || "";
  const offer = cfg.offer && byId(cfg.offer.productId) ? cfg.offer : null;
  const offerEnd = offer ? new Date(offer.endsAt).getTime() : 0;
  const offerActive = () => !!offer && Date.now() < offerEnd;
  const priceOf = (p) => (offerActive() && p.id === offer.productId ? round50(p.price * (1 - offer.discount)) : p.price);
  products.forEach((p) => {
    p._search = norm([p.name, p.origin, p.notes, p.roast, p.badge || "", ...(p.categories || []).map(catLabel)].join(" "));
  });

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
  $$("[data-count-products]").forEach((el) => (el.textContent = products.length));
  $$("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));
  $("#shop-address").textContent = cfg.shop.address;
  $("#shop-phone").textContent = cfg.shop.phoneDisplay;
  $("#shop-phone").href = telLink;
  $("#shop-hours").innerHTML = cfg.shop.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`).join("");
  const { lat, lng } = cfg.shop;
  $("#maps-link").href = $("#map-fallback").href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(lat + "," + lng);
  $("#map").src =
    "https://www.openstreetmap.org/export/embed.html?bbox=" + [lng - 0.012, lat - 0.008, lng + 0.012, lat + 0.008].join(",") +
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

  // Moyens de paiement : vrais logos quand ils existent, sinon badge coloré
  const payVisual = (p) =>
    p.logo
      ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">`
      : `<span class="logo-tile__badge" style="background:${esc(p.color)};color:${esc(p.ink)}">${esc(p.name.split(" ")[0])}</span>`;
  $("#pay-list").innerHTML = cfg.payments
    .map((p) => `<li class="logo-tile" title="${esc(p.name)}">${payVisual(p)}<small>${esc(p.name)}${p.note ? " · " + esc(p.note) : ""}</small></li>`)
    .join("");
  $("#footer-pay").innerHTML = cfg.payments
    .map((p) => `<li title="${esc(p.name)}">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : esc(p.name.split(" ")[0])}</li>`)
    .join("");
  $("#order-pay").innerHTML = cfg.payments
    .map(
      (p, i) => `<label><input type="radio" name="payment" value="${esc(p.name)}"${i === 0 ? " checked" : ""}>
        <span>${p.logo ? `<img src="${esc(p.logo)}" alt="">` : `<i style="background:${esc(p.color)}"></i>`}${esc(p.name)}</span></label>`
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
    (cfg.delivery.freeFrom != null ? " Livraison offerte dès " + fmt(cfg.delivery.freeFrom) + " d'achat." : "") + " Intérieur du pays : sur devis.";

  /* ---------- Bandeau d'annonce qui défile ---------- */
  const ann = cfg.announcements || [];
  $("#announce").innerHTML = ann.map((m, i) => `<p class="announce__msg${i === 0 ? " is-on" : ""}">${esc(m)}</p>`).join("");
  if (ann.length > 1 && !reduceMotion.matches) {
    let ai = 0;
    setInterval(() => {
      const msgs = $$(".announce__msg");
      msgs[ai].classList.replace("is-on", "is-off");
      const prev = msgs[ai];
      setTimeout(() => prev.classList.remove("is-off"), 650);
      ai = (ai + 1) % msgs.length;
      msgs[ai].classList.add("is-on");
    }, 4200);
  }

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
    document.dispatchEvent(new CustomEvent("themechange", { detail: { dark } }));
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
     Ouvert / fermé (heure d'Abidjan = GMT)
     ============================================================ */
  const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function openStatus() {
    const now = new Date();
    const day = now.getUTCDay();
    const h = now.getUTCHours() + now.getUTCMinutes() / 60;
    const today = cfg.shop.support[day];
    if (today && h >= today[0] && h < today[1]) return { open: true, text: `En ligne · nous répondons jusqu'à ${today[1]} h` };
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
     Tiroirs (menu, panier)
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
      ? notifs.map((n) => `<li class="${readIds.includes(n.id) ? "" : "is-unread"}"><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p></li>`).join("")
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
    if (!open && panel.hidden) return;
    panel.hidden = !open;
    $("#notif-btn").setAttribute("aria-expanded", String(open));
    if (open) {
      setTimeout(() => {
        readIds = notifs.map((n) => n.id);
        store.set("notifs-read", readIds);
        $("#notif-count").hidden = true;
      }, 1200);
    } else renderNotifs();
  }
  if (renderNotifs() && !reduceMotion.matches) setTimeout(() => $("#notif-btn").classList.add("is-ringing"), 1800);
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
     Catégories, tuiles, boutique
     ============================================================ */
  let activeCat = "all";
  let query = "";
  let sortBy = "default";
  const allCats = [{ id: "all", label: "Tous les cafés" }].concat(cfg.categories);
  const inCat = (p, id) => id === "all" || (p.categories || []).includes(id);
  const count = (id) => products.filter((p) => inCat(p, id)).length;
  const chipHTML = (c) =>
    `<button type="button" class="chip" role="tab" data-cat="${esc(c.id)}" aria-selected="${c.id === activeCat}">${esc(c.label)} <small>${count(c.id)}</small></button>`;
  $("#cats").innerHTML = allCats.map(chipHTML).join("");
  $("#menu-cats").innerHTML = allCats.map(chipHTML).join("");

  const tileColors = ["#f6dcc4", "#e9e4d4", "#dfe9dc", "#dfe6ee", "#efe0d6", "#f3e3b8"];
  $("#tiles").innerHTML = cfg.categories
    .map((c, i) => {
      const p = products.find((x) => inCat(x, c.id));
      return `<button type="button" class="tile" data-cat="${esc(c.id)}" style="--c:${tileColors[i % tileColors.length]}">
        <strong>${esc(c.label)}</strong><small>${count(c.id)} café${count(c.id) > 1 ? "s" : ""} →</small>
        ${p ? imgTag(p.image, "", 300) : ""}</button>`;
    })
    .join("");

  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat]");
    if (!chip) return;
    setCategory(chip.dataset.cat, true);
    hideDrawer(false);
  });
  function setCategory(id, scroll) {
    activeCat = id;
    $$(".chip[data-cat]").forEach((c) => c.setAttribute("aria-selected", String(c.dataset.cat === id)));
    applyFilters();
    if (scroll) $("#cafes").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  function productCard(p) {
    const beans = Array.from({ length: 5 }, (_, i) => `<i class="${i < p.intensity ? "on" : ""}"></i>`).join("");
    const promo = priceOf(p) < p.price;
    return `
      <article class="product" data-id="${esc(p.id)}">
        <div class="product__visual">
          ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ""}
          ${promo ? `<span class="product__badge product__badge--promo">−${Math.round(offer.discount * 100)} %</span>` : ""}
          ${imgTag(p.image, p.name, 400)}
          <button type="button" class="product__quick" data-add="${esc(p.id)}" tabindex="-1" aria-hidden="true">${icon("bag")} Ajout rapide</button>
        </div>
        <div class="product__body">
          <p class="product__origin">${esc(p.origin)}</p>
          <h3>${esc(p.name)}</h3>
          <p class="product__notes">${esc(p.notes)}</p>
          <div class="product__foot">
            <p class="price">${fmt(priceOf(p))}${promo ? `<s>${fmt(p.price)}</s>` : ""}<small>${esc(p.size)} · <span class="beans" aria-label="Intensité ${p.intensity} sur 5">${beans}</span></small></p>
            <button type="button" class="add" data-add="${esc(p.id)}" aria-label="Ajouter ${esc(p.name)} au panier">${icon("plus", "ic-plus")}${icon("check", "ic-check")}</button>
          </div>
        </div>
      </article>`;
  }
  $("#products").innerHTML = products.map(productCard).join("");

  function matches(p) {
    if (!inCat(p, activeCat)) return false;
    return !query || norm(query).split(/\s+/).every((w) => p._search.includes(w));
  }
  function applyFilters() {
    const grid = $("#products");
    const order = products.slice();
    if (sortBy === "price-asc") order.sort((a, b) => priceOf(a) - priceOf(b));
    if (sortBy === "price-desc") order.sort((a, b) => priceOf(b) - priceOf(a));
    if (sortBy === "intensity") order.sort((a, b) => b.intensity - a.intensity);
    if (sortBy === "soft") order.sort((a, b) => a.intensity - b.intensity);
    let n = 0;
    order.forEach((p) => {
      const card = $(`.product[data-id="${CSS.escape(p.id)}"]`, grid);
      grid.appendChild(card);
      const ok = matches(p);
      if (ok) n++;
      if (ok && card.hidden && !reduceMotion.matches) {
        card.hidden = false;
        card.classList.add("is-visible");
        card.animate([{ opacity: 0, transform: "translateY(16px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
      card.hidden = !ok;
    });
    $("#empty").hidden = n > 0;
    $("#result-count").textContent =
      `${n} café${n > 1 ? "s" : ""}` + (activeCat === "all" ? "" : " · " + catLabel(activeCat)) + (query ? ` · « ${query} »` : "");
  }
  $("#sort").addEventListener("change", (e) => {
    sortBy = e.target.value;
    applyFilters();
  });
  $("#reset-filters").addEventListener("click", () => {
    query = "";
    $("#search-input").value = "";
    setCategory("all", false);
  });
  applyFilters();

  // Carte produit mise en avant dans le haut de page
  const star = products[0];
  $("#stage-card").innerHTML = `${imgTag(star.image, "", 58)}<div><strong>${esc(star.name)}</strong><small>${esc(star.size)}</small><b>${fmt(priceOf(star))}</b></div>
    <button type="button" class="add" data-add="${esc(star.id)}" aria-label="Ajouter ${esc(star.name)} au panier">${icon("plus", "ic-plus")}${icon("check", "ic-check")}</button>`;

  /* ---------- Recherche ---------- */
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
            <img src="${esc(p.image)}" alt="" width="44" height="44"><span><strong>${esc(p.name)}</strong><small>${esc(p.notes)}</small></span><em>${fmt(priceOf(p))}</em></button>`
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
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && items.length) {
      e.preventDefault();
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
    replay(card, "is-hit");
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#search")) closeResults();
    if (!e.target.closest(".notif")) toggleNotif(false);
  });
  function closeMobileSearch(keepQuery) {
    $("#nav").classList.remove("is-searching");
    if (!keepQuery && window.innerWidth < 960) {
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

  /* ============================================================
     Diaporama du haut de page
     ============================================================ */
  const slides = cfg.slides || [];
  const hero = $("#hero");
  const delay = cfg.slideDelay || 6000;
  hero.style.setProperty("--delay", delay + "ms");
  const words = (t) => t.split(" ").map((w, i) => `<span class="w" style="--i:${i}">${esc(w)}</span>`).join(" ");
  $("#slides").innerHTML = slides
    .map(
      (s, i) => `
    <div class="slide${i === 0 ? " is-active" : ""}" role="group" aria-roledescription="diapositive" aria-label="${i + 1} sur ${slides.length}"${i ? ' aria-hidden="true"' : ""}>
      <p class="slide__eyebrow">${esc(s.eyebrow)}</p>
      ${i === 0 ? `<h1>${words(s.title)}</h1>` : `<h2>${words(s.title)}</h2>`}
      <p>${esc(s.text)}</p>
      <div class="slide__actions">
        <a href="${esc(s.href)}" class="btn btn--lg magnetic">${esc(s.cta)} ${icon("right")}</a>
        <a href="${waLink("Bonjour Aube Café !")}" class="btn btn--ghost btn--lg" target="_blank" rel="noopener">${icon("wa")} WhatsApp</a>
      </div>
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
  let paused = reduceMotion.matches;
  let hovering = false;
  function go(i) {
    const next = (i + slides.length) % slides.length;
    if (next === current) return;
    const prev = slideEls[current];
    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");
    prev.setAttribute("aria-hidden", "true");
    setTimeout(() => prev.classList.remove("is-leaving"), 400);
    slideEls[next].classList.add("is-active");
    slideEls[next].removeAttribute("aria-hidden");
    dotEls.forEach((d, k) => d.setAttribute("aria-selected", String(k === next)));
    current = next;
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
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
  let startX = null;
  $("#slides").addEventListener("pointerdown", (e) => (startX = e.clientX));
  $("#slides").addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
  setPaused(paused);

  /* ---------- Étiquettes à déplacer dans le haut de page ---------- */
  $$("[data-drag]").forEach((st) => {
    let sx, sy, ox = 0, oy = 0, moved = false;
    st.addEventListener("pointerdown", (e) => {
      st.setPointerCapture(e.pointerId);
      sx = e.clientX - ox;
      sy = e.clientY - oy;
      moved = false;
      st.classList.add("is-dragging");
      st.style.animation = "none";
    });
    st.addEventListener("pointermove", (e) => {
      if (!st.classList.contains("is-dragging")) return;
      ox = e.clientX - sx;
      oy = e.clientY - sy;
      moved = true;
      st.style.transform = `translate(${ox}px, ${oy}px) rotate(${Math.max(-20, Math.min(20, ox / 8))}deg)`;
    });
    const end = () => {
      if (!st.classList.contains("is-dragging")) return;
      st.classList.remove("is-dragging");
      st.style.transform = `translate(${ox}px, ${oy}px)`;
      if (!moved) replay(st, "is-pop");
    };
    st.addEventListener("pointerup", end);
    st.addEventListener("pointercancel", end);
  });

  /* ============================================================
     Panier (cafés seuls et coffrets)
     ============================================================ */
  // Clés : "id|mouture" pour un café, "box:id1+id2+id3|mouture" pour un coffret
  let cart = store.get("cart-v2", {});
  const coffret = cfg.coffret || { size: 3, discount: 0.1 };
  function parseKey(key) {
    const [item, grind] = key.split("|");
    if (item.startsWith("box:")) {
      const items = item.slice(4).split("+").map(byId);
      if (items.some((p) => !p)) return null;
      const full = items.reduce((s, p) => s + p.price, 0);
      const unit = round50(items.reduce((s, p) => s + priceOf(p), 0) * (1 - coffret.discount));
      return { box: true, items, grind, unit, full, name: "Coffret découverte" };
    }
    const p = byId(item);
    if (!p) return null;
    return { box: false, p, items: [p], grind, unit: priceOf(p), full: p.price, name: p.name };
  }
  Object.keys(cart).forEach((k) => {
    if (!parseKey(k) || !(cart[k] > 0)) delete cart[k];
  });
  const save = () => store.set("cart-v2", cart);
  const orderForm = $("#order-form");
  const lines = () =>
    Object.entries(cart).map(([key, qty]) => {
      const l = parseKey(key);
      return Object.assign(l, { key, qty, total: l.unit * qty, saved: (l.full - l.unit) * qty });
    });
  function totals() {
    const ls = lines();
    const sub = ls.reduce((s, l) => s + l.total, 0);
    const saved = ls.reduce((s, l) => s + l.saved, 0);
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
    return { sub, saved, ship, shipLabel, total: sub + ship, mode, commune, free };
  }
  function renderCart() {
    const ls = lines();
    const grindOpts = (g) => cfg.grinds.map((x) => `<option${x === g ? " selected" : ""}>${esc(x)}</option>`).join("");
    $("#cart-items").innerHTML = ls
      .map(
        (l) => `<li class="line" data-key="${esc(l.key)}">
        <div class="line__img${l.box ? " line__img--box" : ""}">${l.items.map((p) => imgTag(p.image, "", 64)).join("")}</div>
        <div class="line__info"><strong>${esc(l.name)}${l.box ? `<span class="line__tag">−${Math.round(coffret.discount * 100)} %</span>` : ""}</strong>
          <span class="muted small">${l.box ? esc(l.items.map((p) => p.name).join(" · ")) : `${esc(l.p.size)} · ${fmt(l.unit)}`}</span><br>
          <select aria-label="Mouture pour ${esc(l.name)}" data-grind>${grindOpts(l.grind)}</select></div>
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
    $("#t-save-row").hidden = !t.saved;
    $("#t-save").textContent = "− " + fmt(t.saved);
    $("#t-ship").textContent = t.shipLabel;
    $("#t-total").textContent = fmt(t.total) + (t.mode === "livraison" && !t.free && !t.ship && t.sub ? " + livraison" : "");
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

  // Grain de café qui vole du bouton jusqu'au panier
  function flyBean(from) {
    const target = window.innerWidth < 960 && !$("#cart-bar").hidden ? $("#cart-bar") : $("#cart-btn");
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
  function addToCart(key, from, label) {
    cart[key] = (cart[key] || 0) + 1;
    save();
    const after = () => {
      renderCart();
      replay($("#cart-btn"), "is-bump");
      replay($("#cart-count"), "is-pop");
      if (!$("#cart-bar").hidden) replay($("#cart-bar"), "is-bump");
    };
    if (reduceMotion.matches || !from) after();
    else flyBean(from).then(after);
    toast(`${label} ajouté au panier ☕`);
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = byId(btn.dataset.add);
    if (btn.classList.contains("add")) {
      replay(btn, "is-added");
      setTimeout(() => btn.classList.remove("is-added"), 1400);
    } else {
      btn.classList.add("is-added");
      setTimeout(() => btn.classList.remove("is-added"), 1200);
    }
    addToCart(p.id + "|" + cfg.grinds[0], btn, p.name);
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
    replay($(`.line[data-key="${CSS.escape(newKey)}"]`), "is-flash");
  });
  orderForm.addEventListener("change", (e) => {
    if (e.target.name === "mode" || e.target.name === "commune") renderCart();
  });

  /* ---------- Validation des formulaires ---------- */
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
    const rules = [["name", "Indiquez votre nom, s'il vous plaît."], ["phone", "Ce numéro de téléphone semble incomplet.", phoneOk]];
    if (t.mode === "livraison") rules.push(["commune", "Choisissez votre commune de livraison."], ["address", "Indiquez votre adresse ou un repère."]);
    if (!check(orderForm, rules)) return;
    const zone = t.commune === "autre" ? "Autre ville" : t.commune;
    const msg = [
      `Bonjour ${cfg.brand} ! Je souhaite passer commande :`,
      "",
      ...lines().map((l) =>
        l.box
          ? `• ${l.qty} × Coffret découverte (${l.items.map((p) => p.name).join(", ")} — ${l.grind}) = ${fmt(l.total)}`
          : `• ${l.qty} × ${l.p.name} (${l.p.size}, ${l.grind}) = ${fmt(l.total)}`
      ),
      "",
      `Sous-total : ${fmt(t.sub)}`,
      t.saved ? `Économies : ${fmt(t.saved)}` : null,
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
    beanRain(28);
  });

  /* ============================================================
     Offre de la semaine + compte à rebours
     ============================================================ */
  if (offerActive()) {
    const p = byId(offer.productId);
    $("#offre").hidden = false;
    $("#deal-title").textContent = offer.title;
    $("#deal-text").textContent = offer.text;
    $("#deal-price").textContent = fmt(priceOf(p));
    $("#deal-old").textContent = fmt(p.price);
    $("#deal-burst").innerHTML = `<span>−${Math.round(offer.discount * 100)}%</span>`;
    const img = $("#deal-img");
    img.src = p.image;
    img.alt = p.name;
    if (isPhoto(p.image)) img.classList.add("is-photo");
    $("#deal-add").addEventListener("click", (e) => addToCart(p.id + "|" + cfg.grinds[0], e.currentTarget, p.name));
    const units = { d: 86400, h: 3600, m: 60, s: 1 };
    const tick = () => {
      let left = Math.max(0, Math.floor((offerEnd - Date.now()) / 1000));
      if (!left) {
        $("#offre").hidden = true;
        return;
      }
      for (const [u, secs] of Object.entries(units)) {
        const v = String(Math.floor(left / secs)).padStart(2, "0");
        left %= secs;
        const el = $(`[data-unit="${u}"]`);
        if (el.textContent !== v) {
          el.textContent = v;
          replay(el, "is-flip");
        }
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ============================================================
     Quiz « Trouvez votre café »
     ============================================================ */
  const QUIZ = [
    {
      q: "Comment buvez-vous votre café ?",
      a: [
        ["☕", "Espresso bien serré", { intense: 2 }, "Espresso"],
        ["🥛", "Avec du lait", { lait: 2, chocolat: 1 }, "Espresso"],
        ["🫖", "Filtre, tranquille", { filtre: 2, fruite: 1 }, "Filtre"],
        ["🤔", "Je découvre", { doux: 2 }, "En grains"]
      ]
    },
    {
      q: "Quels arômes vous font envie ?",
      a: [
        ["🍫", "Chocolat & noisette", { chocolat: 2 }],
        ["🍓", "Fruits & fleurs", { fruite: 2, floral: 1 }],
        ["🌶️", "Épices & caractère", { epices: 2, intense: 1 }],
        ["🍯", "Caramel & douceur", { caramel: 2, doux: 1 }]
      ]
    },
    {
      q: "Le réveil idéal, c'est…",
      a: [
        ["⚡", "Un vrai coup de fouet", { intense: 2 }],
        ["🌅", "Tout en douceur", { doux: 2 }],
        ["💎", "Une expérience rare", { rare: 3 }],
        ["🎲", "Surprenez-moi !", {}]
      ]
    }
  ];
  let qStep = 0;
  let qScore = {};
  let qGrind = cfg.grinds[0];
  function renderQuiz() {
    const body = $("#quiz-body");
    $("#quiz-bar").style.width = (qStep / QUIZ.length) * 100 + "%";
    if (qStep < QUIZ.length) {
      const s = QUIZ[qStep];
      body.innerHTML = `<div class="quiz__step"><span class="quiz__count">Question ${qStep + 1} sur ${QUIZ.length}</span>
        <h3 class="quiz__q">${esc(s.q)}</h3>
        <div class="quiz__options">${s.a.map((o, i) => `<button type="button" class="quiz__opt" data-opt="${i}"><span>${o[0]}</span>${esc(o[1])}</button>`).join("")}</div></div>`;
      return;
    }
    // Résultat : score de chaque café selon ses profils aromatiques
    const ranked = products
      .map((p) => {
        const tags = (p.tags || "").split(" ");
        return { p, score: tags.reduce((s, t) => s + (qScore[t] || 0), 0) + Math.random() * 0.5 };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0].p;
    body.innerHTML = `<div class="quiz__result">
      <span class="quiz__count">Votre café idéal</span>
      <div class="quiz__match">${imgTag(best.image, best.name, 140)}
        <div><h3>${esc(best.name)}</h3><p>${esc(best.notes)} · ${esc(best.roast)}. Nous vous conseillons la mouture « ${esc(qGrind)} ».</p>
        <p class="price">${fmt(priceOf(best))} <small>${esc(best.size)}</small></p>
        <button type="button" class="btn btn--accent" id="quiz-add">${icon("bag")} Ajouter au panier</button></div>
      </div>
      <div class="quiz__alts"><span class="muted">À essayer aussi :</span>${ranked
        .slice(1, 3)
        .map((r) => `<button type="button" data-goto="${esc(r.p.id)}">${esc(r.p.name)}</button>`)
        .join("")}</div>
      <button type="button" class="link-btn" id="quiz-restart">${icon("refresh")} Recommencer le quiz</button>
    </div>`;
    $("#quiz-add").addEventListener("click", (e) => addToCart(best.id + "|" + qGrind, e.currentTarget, best.name));
    $("#quiz-restart").addEventListener("click", () => {
      qStep = 0;
      qScore = {};
      renderQuiz();
    });
    beanRain(16);
  }
  $("#quiz-body").addEventListener("click", (e) => {
    const alt = e.target.closest("[data-goto]");
    if (alt) return goToProduct(alt.dataset.goto);
    const opt = e.target.closest("[data-opt]");
    if (!opt) return;
    const o = QUIZ[qStep].a[+opt.dataset.opt];
    Object.entries(o[2]).forEach(([k, v]) => (qScore[k] = (qScore[k] || 0) + v));
    if (o[3]) qGrind = o[3];
    opt.classList.add("is-picked");
    setTimeout(() => {
      qStep++;
      renderQuiz();
    }, reduceMotion.matches ? 0 : 380);
  });
  renderQuiz();

  /* ============================================================
     Coffret découverte
     ============================================================ */
  const eligible = products.filter((p) => /^250\s*g$/i.test(p.size));
  let picks = [];
  $("#box-picker").innerHTML = eligible
    .map((p) => `<button type="button" class="pick" data-pick="${esc(p.id)}" aria-pressed="false">${imgTag(p.image, "", 52)}<span><strong>${esc(p.name)}</strong><small>${fmt(priceOf(p))}</small></span></button>`)
    .join("");
  function renderBox() {
    $("#box-slots").innerHTML = Array.from({ length: coffret.size }, (_, i) => {
      const p = byId(picks[i]);
      return p
        ? `<div class="slot is-filled">${imgTag(p.image, p.name, 120)}<button type="button" data-unpick="${i}" aria-label="Retirer ${esc(p.name)}">${icon("close")}</button></div>`
        : `<div class="slot">${i + 1}</div>`;
    }).join("");
    const full = picks.map(byId).reduce((s, p) => s + p.price, 0);
    const now = picks.map(byId).reduce((s, p) => s + priceOf(p), 0);
    const price = round50(now * (1 - coffret.discount));
    $("#box-total").innerHTML = picks.length
      ? picks.length === coffret.size
        ? `<strong>${fmt(price)}</strong><s>${fmt(full)}</s> · vous économisez ${fmt(full - price)} 🎉`
        : `Encore ${coffret.size - picks.length} café${coffret.size - picks.length > 1 ? "s" : ""} à choisir…`
      : "Choisissez trois cafés dans la liste.";
    $("#box-add").disabled = picks.length !== coffret.size;
    $$("[data-pick]").forEach((b) => {
      const inBox = picks.includes(b.dataset.pick);
      b.classList.toggle("is-in", inBox);
      b.setAttribute("aria-pressed", String(inBox));
      b.disabled = !inBox && picks.length >= coffret.size;
    });
    if (picks.length === coffret.size) replay($("#box"), "is-full");
  }
  $("#box-picker").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pick]");
    if (!b) return;
    const id = b.dataset.pick;
    picks = picks.includes(id) ? picks.filter((x) => x !== id) : picks.concat(id).slice(0, coffret.size);
    renderBox();
  });
  $("#box-slots").addEventListener("click", (e) => {
    const b = e.target.closest("[data-unpick]");
    if (!b) return;
    picks.splice(+b.dataset.unpick, 1);
    renderBox();
  });
  $("#box-random").addEventListener("click", () => {
    const pool = eligible.map((p) => p.id).sort(() => Math.random() - 0.5);
    picks = pool.slice(0, coffret.size);
    renderBox();
  });
  $("#box-add").addEventListener("click", (e) => {
    addToCart("box:" + picks.join("+") + "|" + cfg.grinds[0], e.currentTarget, "Coffret découverte");
    picks = [];
    renderBox();
  });
  renderBox();

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
    const avg = ids.map((id) => (byId(id).price / grams(byId(id).size)) * 1000).reduce((a, b) => a + b, 0) / ids.length;
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
     Renseignements
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
      }, 6000);
    }
  } catch (e) {
    /* pas de stockage : pas d'info-bulle */
  }

  /* ============================================================
     Animations fun
     ============================================================ */
  // Pluie de grains de café
  function beanRain(n) {
    if (reduceMotion.matches) return;
    for (let i = 0; i < n; i++) {
      const b = document.createElement("span");
      b.className = "rain-bean";
      b.style.left = Math.random() * 100 + "vw";
      b.style.setProperty("--d", 1.6 + Math.random() * 1.6 + "s");
      b.style.setProperty("--r", (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540) + "deg");
      b.style.animationDelay = Math.random() * 0.8 + "s";
      b.style.scale = 0.7 + Math.random() * 0.7;
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 4000);
    }
  }
  // Petit secret : 5 clics rapides sur le logo
  let logoClicks = 0;
  let logoTimer;
  $("#logo").addEventListener("click", () => {
    replay($("#logo"), "is-wobble");
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => (logoClicks = 0), 1500);
    if (logoClicks >= 5) {
      logoClicks = 0;
      beanRain(60);
      toast("Il pleut du café sur Babi ! ☕☔");
    }
  });
  // Grand mot du pied de page, lettre par lettre
  const big = $("#bigword");
  big.innerHTML = big.textContent.split("").map((c) => (c === " " ? " " : `<span>${esc(c)}</span>`)).join("");
  // Boutons « magnétiques » qui suivent légèrement la souris
  if (finePointer.matches && !reduceMotion.matches) {
    document.addEventListener("pointermove", (e) => {
      const m = e.target.closest && e.target.closest(".magnetic");
      $$(".magnetic.is-mag").forEach((b) => {
        if (b !== m) {
          b.classList.remove("is-mag");
          b.style.translate = "";
        }
      });
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.classList.add("is-mag");
      m.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    // Inclinaison 3D des cartes produits
    $$(".product").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- En-tête, lien actif, progression, apparitions ---------- */
  const nav = $("#nav");
  const journey = $("#journey");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    const r = journey.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / (r.height + window.innerHeight * 0.2)));
    journey.style.setProperty("--p", p.toFixed(3));
  };
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
    ["cafes", "coffret", "quiz", "devis", "boutique"].forEach((id) => spy.observe(document.getElementById(id)));
    const groups = [
      ".section__head", ".perk", ".tile", ".product", ".deal", ".quiz__card", ".coffret > *", ".journey li", ".logo-tile",
      ".quote > *", ".find > *", ".zones", ".support > *", ".faq details", ".contact > *", ".join", ".footer__grid > *"
    ];
    const targets = [];
    groups.forEach((s) =>
      $$(s).forEach((el, i) => {
        el.classList.add("reveal");
        el.style.setProperty("--delay", (i % 6) * 70 + "ms");
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
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
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

  renderCart();
})();
