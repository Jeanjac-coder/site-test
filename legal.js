/* Remplit les pages légales avec les informations de config.js (un seul endroit à modifier). */
(function () {
  "use strict";
  const cfg = window.SITE_CONFIG;
  const money = new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency });
  const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);

  set("[data-cfg=email]", (el) => {
    el.textContent = cfg.email;
    if (el.tagName === "A") el.href = "mailto:" + cfg.email;
  });
  set("[data-cfg=phone]", (el) => {
    el.textContent = cfg.shop.phoneDisplay;
    if (el.tagName === "A") el.href = "tel:" + cfg.shop.phoneDisplay.replace(/\s/g, "");
  });
  set("[data-cfg=whatsapp]", (el) => (el.href = "https://wa.me/" + cfg.whatsapp));
  set("[data-cfg=address]", (el) => (el.textContent = cfg.shop.address));
  set("[data-cfg=brand]", (el) => (el.textContent = cfg.brand));
  set("[data-cfg=free]", (el) => (el.textContent = cfg.delivery.freeFrom != null ? money.format(cfg.delivery.freeFrom) : "—"));
  set("[data-cfg=delay]", (el) => (el.textContent = cfg.delivery.delay));
  set("[data-cfg=payments]", (el) => (el.textContent = cfg.payments.map((p) => p.name).join(", ")));
  set("[data-cfg=hours]", (el) => (el.innerHTML = cfg.shop.hours.map(([d, h]) => `${d} : ${h}`).join("<br>")));
  set("[data-cfg=zones]", (el) => {
    el.innerHTML =
      "<thead><tr><th>Commune</th><th>Frais de livraison</th></tr></thead><tbody>" +
      cfg.delivery.zones.map((z) => `<tr><td>${z.name}</td><td>${money.format(z.fee)}</td></tr>`).join("") +
      "<tr><td>Autres villes de Côte d'Ivoire</td><td>Sur devis</td></tr></tbody>";
  });
  // Logo clair en mode sombre
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark && cfg.images.logoSombre) set('img[src="images/logo.svg"]', (img) => (img.src = cfg.images.logoSombre));

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
