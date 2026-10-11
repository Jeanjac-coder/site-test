#!/usr/bin/env python3
"""
Assemble les pages du site Aube Café à partir des morceaux du dossier src/.

  src/partials/top.html     en-tête commun (icônes, loader, bandeau, navigation, recherche)
  src/partials/bottom.html  pied de page, panier, favoris, fenêtres, assistant, scripts
  src/sections/*.html       sections réutilisables (hero, boutique, contact…)
  src/legal/*.html          contenu des pages légales

Après une modification dans src/, lancez :   python3 src/build.py
Les fichiers .html à la racine sont réécrits (ne les modifiez pas directement).
"""
import json
import re
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent
SITE = "https://aubecafe.ci"  # EXEMPLE : adresse définitive du site

top = (SRC / "partials/top.html").read_text()
bottom = (SRC / "partials/bottom.html").read_text()


def section(name, **repl):
    html = (SRC / f"sections/{name}.html").read_text()
    if repl.pop("no_head", False):
        # La page a déjà son grand titre : on retire l'en-tête de la section
        html = re.sub(r"\n\s*<header class=\"head[^\"]*\">.*?</header>", "", html, count=1, flags=re.S)
    if repl.pop("no_title", False):
        # Garde l'en-tête (onglets…) mais retire le titre déjà présent en haut de page
        html = re.sub(r"<div>\s*<p class=\"eyebrow\".*?</h2>\s*</div>\s*", "", html, count=1, flags=re.S)
        html = html.replace('class="head head--row"', 'class="head head--row head--tight head--tabs"', 1)
    for k, v in repl.items():
        html = html.replace("{{%s}}" % k, v)
    return re.sub(r"\{\{[A-Z_]+\}\}", "", html)


def page_hero(key, crumb, eyebrow, title, lead, image=None):
    img = f'\n        <div class="page-hero__img"><img src="{image}" alt="" width="960" height="720" fetchpriority="high"></div>' if image else ""
    return f'''    <!-- ===================== EN-TÊTE DE PAGE ===================== -->
    <section class="page-hero{' page-hero--img' if image else ''}">
      <div class="container page-hero__inner">
        <div>
          <nav class="crumbs" aria-label="Fil d'Ariane"><a href="index.html" data-i18n="nav.home">Accueil</a><span aria-hidden="true">/</span><span aria-current="page" data-i18n="{crumb[0]}">{crumb[1]}</span></nav>
          <p class="eyebrow" data-i18n="ph.{key}.eyebrow">{eyebrow}</p>
          <h1 data-i18n="ph.{key}.title">{title}</h1>
          <p class="page-hero__lead" data-i18n="ph.{key}.lead">{lead}</p>
        </div>{img}
      </div>
    </section>
'''


def head(title, desc, path, extra=""):
    url = f"{SITE}/{path}" if path != "index.html" else f"{SITE}/"
    return f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0e0b09" media="(prefers-color-scheme: dark)">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Aube Café">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}/images/partage.png">
  <meta property="og:locale" content="fr_CI">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
  <link rel="icon" href="images/icon-192.png" sizes="192x192" type="image/png">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="preload" href="fonts/open-sauce-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/open-sauce-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>{extra}
  <link rel="stylesheet" href="styles.css">
  <script>
    document.documentElement.classList.add("js");
    try {{
      var t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t;
      var l = localStorage.getItem("lang"); if (l === "en") document.documentElement.lang = "en";
      if (sessionStorage.getItem("loaded")) document.documentElement.classList.add("no-loader");
    }} catch (e) {{}}
  </script>
</head>
'''


HOME_EXTRA = '''
  <link rel="preload" href="images/hero/hero-1.webp" as="image" type="image/webp" media="(min-width: 700px)">
  <link rel="preload" href="images/hero/hero-1-sm.webp" as="image" type="image/webp" media="(max-width: 699px)">
  <script type="application/ld+json" id="ld-business"></script>'''


def build(path, page, title, desc, body, extra="", modules=""):
    html = head(title, desc, path, extra)
    html += f'<body data-page="{page}">\n\n' + top + '\n  <main id="main">\n\n' + body + "\n  </main>\n\n"
    html += bottom.replace("{{MODULES}}", modules)
    (OUT / path).write_text(html)
    print("écrit", path)


# ---------------- Accueil ----------------
build("index.html", "accueil",
      "Aube Café — Cafés du monde torréfiés à Abidjan | Livraison 24 h",
      "Aube Café : quinze cafés d'exception (Éthiopie, Colombie, Jamaïque, Kenya, robusta ivoirien…) torréfiés chaque semaine à Abidjan. Paiement Mobile Money, livraison en 24 h partout en Côte d'Ivoire.",
      section("hero") + "\n" + section("stats") + "\n" + section("selection") + "\n"
      + section("explorer", EXPLORE_CTA='<p class="center" style="margin:40px 0 0"><a href="origines.html" class="btn btn--line"><span data-i18n="explore.all">Toutes nos origines</span> <svg class="ic"><use href="#i-right"/></svg></a></p>') + "\n"
      + section("assistant") + "\n"
      + section("apropos", ABOUT_CTA='<p style="margin:28px 0 0"><a href="a-propos.html" class="btn btn--line"><span data-i18n="about.more">Notre histoire</span> <svg class="ic"><use href="#i-right"/></svg></a></p>') + "\n"
      + section("avis") + "\n"
      + section("blog", BLOG_CTA='<a href="blog.html" class="btn btn--line"><span data-i18n="blog.all">Tout le journal</span> <svg class="ic"><use href="#i-right"/></svg></a>', BLOG_LIMIT=' data-limit="3"') + "\n"
      + section("cta") + "\n" + section("confiance"),
      extra=HOME_EXTRA, modules='  <script type="module" src="cafe-3d.js"></script>\n')

# ---------------- Nos cafés ----------------
build("cafes.html", "cafes",
      "Nos cafés — 15 cafés du monde torréfiés à Abidjan | Aube Café",
      "Éthiopie, Colombie, Kenya, Jamaïque Blue Mountain, Panama Geisha, robusta ivoirien… Filtrez par origine, intensité, arômes et méthode, et commandez sur WhatsApp.",
      page_hero("cafes", ("nav.coffees", "Nos cafés"), "La collection", "Quinze cafés. <em>Un seul critère : l'excellence.</em>",
                "Chaque grain est sélectionné à la source puis torréfié à Abidjan, en petites quantités. Choisissez le vôtre, on s'occupe du reste.")
      + section("boutique", no_head=True) + "\n" + section("pourvous") + "\n" + section("assistant") + "\n" + section("confiance"))

# ---------------- Origines ----------------
build("origines.html", "origines",
      "Nos origines — Afrique, Amériques, Asie | Aube Café",
      "Découvrez les terroirs de nos cafés : Éthiopie, Kenya, Rwanda, Côte d'Ivoire, Colombie, Brésil, Guatemala, Costa Rica, Jamaïque, Panama, Pérou, Vietnam, Indonésie, Inde.",
      page_hero("origins", ("nav.origins", "Origines"), "Nos origines", "Un tour du monde, <em>tasse après tasse.</em>",
                "De l'Afrique de l'Est aux montagnes de Jamaïque, chaque terroir signe sa tasse. Altitude, variété, procédé : voici d'où viennent nos cafés.",
                "images/hero/hero-3-sm.webp")
      + section("explorer") + "\n" + section("origines", no_head=True) + "\n" + section("cta"))

# ---------------- Nos boutiques ----------------
build("boutiques.html", "boutiques",
      "Nos boutiques et points relais à Abidjan | Aube Café",
      "Siège et torréfacteur à Cocody, boutiques au Plateau et en Zone 4, points relais à Angré, Yopougon et Grand-Bassam. Horaires, itinéraires et retrait gratuit.",
      page_hero("stores", ("nav.stores", "Nos boutiques"), "Nos boutiques", "Passez nous voir, <em>on vous attend.</em>",
                "Venez sentir, goûter et repartir avec votre café fraîchement moulu. Ou retirez gratuitement votre commande au plus près de chez vous.")
      + section("adresses", no_title=True) + "\n" + section("infos") + "\n" + section("cta"))

# ---------------- Blog ----------------
build("blog.html", "blog",
      "Le journal — Conseils et histoires de café | Aube Café",
      "Robusta ou arabica, conservation du café sous le climat d'Abidjan, espresso maison : les conseils de nos torréfacteurs.",
      page_hero("blog", ("nav.blog", "Blog"), "Le journal", "Le café, <em>on en parle avec passion.</em>",
                "Conseils de préparation, histoires d'origines et secrets de torréfacteur, sans jargon.")
      + section("blog", no_head=True) + "\n" + section("cta"))

# ---------------- À propos ----------------
build("a-propos.html", "a-propos",
      "À propos — Torréfacteur à Abidjan | Aube Café",
      "Aube Café sélectionne les plus beaux cafés du monde et les torréfie chaque semaine à Abidjan, en petites quantités, pour les livrer frais partout en Côte d'Ivoire.",
      page_hero("about", ("nav.about", "À propos"), "Notre histoire", "Le vrai café, <em>torréfié ici, avec soin.</em>",
                "Une maison ivoirienne née d'une conviction : le bon café n'attend pas. Il se choisit à la source, se torréfie avec patience et se savoure frais.",
                "images/hero/hero-1-sm.webp")
      + section("apropos") + "\n" + section("stats") + "\n" + section("methode") + "\n" + section("avis") + "\n" + section("cta") + "\n" + section("confiance"))

# ---------------- Contact ----------------
build("contact.html", "contact",
      "Contact, devis et service client | Aube Café",
      "Écrivez-nous, demandez un devis entreprise ou trouvez une réponse dans notre centre d'aide. WhatsApp, téléphone, e-mail et assistant en ligne.",
      page_hero("contact", ("nav.contact", "Contact"), "Contact & aide", "Une question, un devis ? <em>On vous répond vite.</em>",
                "WhatsApp, téléphone, e-mail ou assistant en ligne : choisissez ce qui vous arrange. Nous répondons à chaque message avec attention.")
      + section("aide") + "\n" + section("contact") + "\n" + section("devis"))

# ---------------- Pages légales ----------------
legal = json.loads((SRC / "legal/meta.json").read_text())
for name, m in legal.items():
    body = (SRC / f"legal/{name}.html").read_text()
    hero = f'''    <section class="page-hero page-hero--legal">
      <div class="container page-hero__inner">
        <div>
          <nav class="crumbs" aria-label="Fil d'Ariane"><a href="index.html" data-i18n="nav.home">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">{m["title"]}</span></nav>
          <p class="eyebrow">Informations</p>
          <h1>{m["h1"]}</h1>
          <p class="page-hero__lead">Dernière mise à jour : octobre 2026</p>
        </div>
      </div>
    </section>
    <section class="section section--tight">
      <div class="container legal">
{body}      </div>
    </section>
'''
    build(f"{name}.html", "legal", f"{m['title']} — Aube Café", m["desc"], hero,
          extra='\n  <meta name="robots" content="noindex">' if name == "mentions-legales" else "",
          modules='  <script src="legal.js"></script>\n')
