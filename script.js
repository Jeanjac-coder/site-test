(function () {
  "use strict";

  const cfg = window.SITE_CONFIG;
  const $ = (sel) => document.querySelector(sel);
  const STORAGE_KEY = "cart-v1";

  const money = new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency });
  const fmt = (n) => money.format(n);
  const waLink = (text) =>
    "https://wa.me/" + cfg.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");

  // Échappe le texte provenant de la config avant de l'insérer en HTML
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Contenu issu de la configuration ---------- */

  document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = cfg.brand));
  $("#year").textContent = new Date().getFullYear();
  $("#shop-address").textContent = cfg.shop.address;
  $("#shop-phone").textContent = cfg.shop.phoneDisplay;
  $("#shop-phone").href = "tel:" + cfg.shop.phoneDisplay.replace(/\s/g, "");
  $("#maps-link").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.shop.address);
  $("#shop-hours").innerHTML = cfg.shop.hours
    .map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`)
    .join("");
  $("#faq-delivery").textContent = cfg.delivery.delay;

  const helloMsg = `Bonjour ${cfg.brand} ! J'ai une question :`;
  $("#cta-whatsapp").href = waLink(helloMsg);
  $("#wa-float").href = waLink(helloMsg);

  if (cfg.reviews && cfg.reviews.length) {
    $("#reviews").innerHTML = cfg.reviews
      .map((r) => `<blockquote class="review"><p>« ${esc(r.text)} »</p><cite>${esc(r.name)}</cite></blockquote>`)
      .join("");
    $("#reviews-section").hidden = false;
  }

  /* ---------- Produits ---------- */

  const grindOptions = cfg.grinds.map((g) => `<option>${esc(g)}</option>`).join("");

  $("#products").innerHTML = cfg.products
    .map((p) => {
      const dots = Array.from({ length: 5 }, (_, i) => `<i class="${i < p.intensity ? "on" : ""}"></i>`).join("");
      return `
      <article class="product" data-id="${esc(p.id)}">
        <div class="product__visual" style="--bag:${esc(p.color || "#D9C2A7")}">
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          <div class="bag"><span>${esc(p.name.split(" ")[0])}</span></div>
        </div>
        <div class="product__body">
          <h3>${esc(p.name)}</h3>
          <p class="muted">${esc(p.notes)}</p>
          <div class="intensity" aria-label="Intensité ${p.intensity} sur 5">
            <span>Intensité</span><span class="dots">${dots}</span>
          </div>
          <div class="product__row">
            <span class="price">${fmt(p.price)} <small>/ ${esc(p.size)}</small></span>
          </div>
          <div class="product__controls">
            <select aria-label="Mouture pour ${esc(p.name)}" class="grind">${grindOptions}</select>
            <button type="button" class="btn btn--small add">Ajouter</button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  /* ---------- Panier ---------- */

  // Une ligne = un café + une mouture. Clé : "id|mouture"
  let cart = {};
  try {
    cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    cart = {};
  }
  // Retire les lignes dont le produit n'existe plus dans la config
  Object.keys(cart).forEach((k) => {
    if (!cfg.products.some((p) => p.id === k.split("|")[0])) delete cart[k];
  });

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* stockage indisponible : le panier reste en mémoire */
    }
  };

  const product = (id) => cfg.products.find((p) => p.id === id);

  function lines() {
    return Object.entries(cart).map(([key, qty]) => {
      const [id, grind] = key.split("|");
      const p = product(id);
      return { key, p, grind, qty, total: p.price * qty };
    });
  }

  function totals() {
    const subtotal = lines().reduce((s, l) => s + l.total, 0);
    const mode = document.querySelector('input[name="mode"]:checked').value;
    let shipping = 0;
    if (mode === "livraison" && subtotal > 0) {
      const free = cfg.delivery.freeFrom != null && subtotal >= cfg.delivery.freeFrom;
      shipping = free ? 0 : cfg.delivery.fee;
    }
    return { subtotal, shipping, total: subtotal + shipping, mode };
  }

  function render() {
    const ls = lines();
    $("#cart-items").innerHTML = ls
      .map(
        (l) => `
      <li class="line" data-key="${esc(l.key)}">
        <div class="line__info">
          <strong>${esc(l.p.name)}</strong>
          <span class="muted small">${esc(l.grind)} · ${esc(l.p.size)}</span>
        </div>
        <div class="qty">
          <button type="button" data-act="dec" aria-label="Retirer un">−</button>
          <span>${l.qty}</span>
          <button type="button" data-act="inc" aria-label="Ajouter un">+</button>
        </div>
        <span class="line__total">${fmt(l.total)}</span>
      </li>`
      )
      .join("");
    $("#cart-empty").hidden = ls.length > 0;

    const t = totals();
    $("#cart-subtotal").textContent = fmt(t.subtotal);

    let shipText = "";
    if (t.mode === "retrait") {
      shipText = "Retrait gratuit en boutique.";
    } else if (t.subtotal > 0) {
      if (t.shipping === 0) shipText = "Livraison offerte 🎉";
      else {
        shipText = `Livraison : ${fmt(t.shipping)}`;
        if (cfg.delivery.freeFrom != null)
          shipText += ` (offerte dès ${fmt(cfg.delivery.freeFrom)}, plus que ${fmt(cfg.delivery.freeFrom - t.subtotal)})`;
      }
      shipText += ` · Total : ${fmt(t.total)}`;
    }
    $("#cart-shipping").textContent = shipText;

    $("#address-field").hidden = t.mode !== "livraison";

    const count = ls.reduce((s, l) => s + l.qty, 0);
    $("#cart-bar").hidden = count === 0;
    $("#cart-bar-count").textContent = count + (count > 1 ? " articles" : " article");
    $("#cart-bar-total").textContent = fmt(t.total);
  }

  $("#products").addEventListener("click", (e) => {
    const btn = e.target.closest(".add");
    if (!btn) return;
    const card = btn.closest(".product");
    const key = card.dataset.id + "|" + card.querySelector(".grind").value;
    cart[key] = (cart[key] || 0) + 1;
    save();
    render();
    btn.textContent = "Ajouté ✓";
    btn.classList.add("is-added");
    setTimeout(() => {
      btn.textContent = "Ajouter";
      btn.classList.remove("is-added");
    }, 1200);
  });

  $("#cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const key = btn.closest(".line").dataset.key;
    cart[key] += btn.dataset.act === "inc" ? 1 : -1;
    if (cart[key] <= 0) delete cart[key];
    save();
    render();
  });

  document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", render));

  /* ---------- Envoi de la commande sur WhatsApp ---------- */

  $("#order-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const err = $("#form-error");
    const ls = lines();
    const t = totals();
    const name = form.elements.name.value.trim();
    const address = form.elements.address.value.trim();
    const note = form.elements.note.value.trim();

    let problem = "";
    if (!ls.length) problem = "Ajoutez au moins un café à votre commande.";
    else if (!name) problem = "Indiquez votre nom.";
    else if (t.mode === "livraison" && !address) problem = "Indiquez votre adresse de livraison.";
    err.textContent = problem;
    if (problem) return;

    const msg = [
      `Bonjour ${cfg.brand} ! Je souhaite passer commande :`,
      "",
      ...ls.map((l) => `• ${l.qty} × ${l.p.name} (${l.p.size}, ${l.grind}) = ${fmt(l.total)}`),
      "",
      `Sous-total : ${fmt(t.subtotal)}`,
      t.mode === "livraison" ? `Livraison : ${t.shipping ? fmt(t.shipping) : "offerte"}` : null,
      `*Total : ${fmt(t.total)}*`,
      "",
      `Nom : ${name}`,
      t.mode === "livraison" ? `Livraison à : ${address}` : "Retrait en boutique",
      note ? `Remarque : ${note}` : null,
      "",
      "Merci !"
    ]
      .filter((x) => x !== null)
      .join("\n");

    window.open(waLink(msg), "_blank", "noopener");
  });

  render();
})();
