# Aube Café — boutique en ligne premium

Site e-commerce d'Aube Café, torréfacteur à Abidjan : 15 cafés du monde, commande, devis et
contact envoyés par **WhatsApp**. Site 100 % statique (HTML, CSS, JavaScript), sans serveur ni
base de données. Aucun paiement n'est saisi sur le site.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.js` | **À modifier** : coordonnées, cafés (prix, stock, badges, notes…), diaporama, offre du moment, adresses (carte), horaires, livraison, paiements, roue de bienvenue, fidélité, notifications, avis |
| `i18n.js` | Textes anglais, textes dynamiques, conseils de préparation, FAQ, articles du blog |
| `index.html` | Structure et textes français de la page |
| `styles.css` | Design (couleurs en haut du fichier : clair puis sombre) et animations |
| `script.js` | Boutique : recherche, filtres, tri, fiches produit, favoris, comparateur, panier, espace client, formulaires, carte, FAQ, FR/EN, thème |
| `effects.js` | Bonus : loader « machine à café », grains qui tombent, ambiance sonore, roue de bienvenue, assistant café, curseur grain, PWA |
| `cafe-3d.js` | Grains de café en 3D flottants dans le haut de page (Three.js) |
| `livraison.html`, `confidentialite.html`, `cgu.html`, `mentions-legales.html` | Pages légales (remplies en partie depuis `config.js` par `legal.js`) |
| `manifest.webmanifest`, `sw.js` | Application installable (PWA) et cache hors ligne |
| `robots.txt`, `sitemap.xml` | Référencement (remplacez `aubecafe.ci` par votre domaine) |

## Fonctionnalités

- **Navigation** : barre collante qui se cache au défilement, mega menu « Nos cafés »
  (origines, torréfaction, méthodes, arômes), recherche instantanée (suggestions, historique,
  clavier, raccourci `/`), notifications, favoris, espace client, panier, FR/EN, clair/sombre, son.
- **Hero** : diaporama plein écran (3 visuels), titres animés mot par mot, recherche,
  catégories populaires, offre du moment avec compte à rebours, cafés à la une avec badges,
  grains 3D qui suivent la souris et s'envolent au défilement.
- **Boutique** : 15 cafés, filtres (origine, torréfaction, intensité, méthode, arômes, prix,
  stock, promo), tri intelligent, badges Nouveauté / Meilleure vente / Promo, stock.
- **Fiche produit** : origine, région, altitude, variété, procédé, intensité/acidité/corps,
  notes, torréfaction, conseils de préparation par méthode, avis, cafés similaires.
- **Favoris**, **comparateur** (jusqu'à 3 cafés), **récemment consultés**, **recommandés**.
- **Panier** : mouture, quantités, livraison / express / retrait, frais par commune (Abidjan
  et intérieur), livraison offerte dès 20 000 F, codes promo, message WhatsApp prêt à envoyer.
- **Espace client** (sur l'appareil) : commandes envoyées, points et niveaux de fidélité,
  badges, code de bienvenue, recommandations.
- **Assistant café** : quiz en 3 questions, recommandation et relais vers un conseiller.
- **Devis**, **contact** (confirmation animée), **carte Google Maps** (siège, boutiques,
  points relais, itinéraires), **service client** (statut réel selon les horaires), **FAQ**.

## À compléter avant la mise en ligne

- `config.js` : adresses réelles, stock, badges, prix, codes de la roue, e-mail, réseaux sociaux.
- `index.html` : adresse du site dans `canonical` et `og:*`, et dans `robots.txt` / `sitemap.xml`.
- Logos officiels manquants (Wave, Mastercard, banques) : déposez-les dans `images/paiement/`
  et ajoutez `logo: "images/paiement/…"` au moyen de paiement dans `config.js`.
- Pages légales : RCCM, NCC, hébergeur, responsable de publication.
- Avis : ajoutez uniquement de **vrais** avis clients (`testimonials` et `reviews`).

## Voir le site en local

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Mise en ligne

- **Netlify** : « Add new site » → « Import from GitHub » → ce dépôt → Deploy.
- **GitHub Pages** : Settings → Pages → choisir la branche → Save.
