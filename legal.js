/* Remplit les pages légales avec les informations de config.js (un seul endroit à modifier). */
(function () {
  "use strict";
  const cfg = window.SITE_CONFIG;
  const money = (n) => new Intl.NumberFormat(cfg.locale, { maximumFractionDigits: 0 }).format(n) + " F CFA";
  const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const siege = cfg.locations.find((l) => l.type === "siege") || cfg.locations[0];

  set("[data-cfg=email]", (el) => {
    el.textContent = cfg.email;
    if (el.tagName === "A") el.href = "mailto:" + cfg.email;
  });
  set("[data-cfg=phone]", (el) => {
    el.textContent = cfg.phoneDisplay;
    if (el.tagName === "A") el.href = "tel:" + cfg.phoneDisplay.replace(/\s/g, "");
  });
  set("[data-cfg=whatsapp]", (el) => (el.href = "https://wa.me/" + cfg.whatsapp));
  set("[data-cfg=address]", (el) => (el.textContent = siege.address + ", Abidjan"));
  set("[data-cfg=brand]", (el) => (el.textContent = cfg.brand));
  set("[data-cfg=url]", (el) => { el.textContent = cfg.url.replace(/^https?:\/\//, ""); if (el.tagName === "A") el.href = cfg.url; });
  set("[data-cfg=free]", (el) => (el.textContent = money(cfg.delivery.freeFrom)));
  set("[data-cfg=express]", (el) => (el.textContent = money(cfg.delivery.expressFee)));
  set("[data-cfg=payments]", (el) => (el.textContent = cfg.payments.map((p) => p.name).join(", ")));
  set("[data-cfg=hours]", (el) => (el.innerHTML = cfg.hours.map((h) => `${esc(h.fr)} : ${esc(h.h)}`).join("<br>")));
  set("[data-cfg=zones]", (el) => {
    el.innerHTML = "<thead><tr><th>Commune</th><th>Frais</th><th>Délai</th></tr></thead><tbody>" +
      cfg.delivery.zones.map((z) => `<tr><td>${esc(z.name)}</td><td>${money(z.fee)}</td><td>24 h ouvrées</td></tr>`).join("") + "</tbody>";
  });
  set("[data-cfg=interior]", (el) => {
    el.innerHTML = "<thead><tr><th>Ville</th><th>Frais</th><th>Délai indicatif</th></tr></thead><tbody>" +
      cfg.delivery.interior.map((z) => `<tr><td>${esc(z.name)}</td><td>${money(z.fee)}</td><td>${esc(z.delay)}</td></tr>`).join("") +
      "<tr><td>Autres localités</td><td>Sur devis</td><td>Communiqué à la confirmation</td></tr></tbody>";
  });
  set("[data-cfg=stores]", (el) => {
    const label = { siege: "Siège", boutique: "Boutique", relais: "Point relais" };
    el.innerHTML = cfg.locations.map((l) => `<li><strong>${esc(l.name)}</strong> (${label[l.type]}) — ${esc(l.address)} · ${esc(l.hours)}</li>`).join("");
  });

  // Logo clair en mode sombre
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark && cfg.images.logoSombre) set('img[src="images/logo.svg"]', (img) => (img.src = cfg.images.logoSombre));

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
