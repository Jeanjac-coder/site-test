# Aube Café — site vitrine et commande

Site d'Aube Café, torréfacteur à Abidjan (boutique physique + vente en ligne), avec commande,
devis et renseignements envoyés par WhatsApp. Site 100 % statique : HTML, CSS et JavaScript,
sans serveur ni base de données.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.js` | **À modifier** : nom, WhatsApp, e-mail, cafés et prix, catégories, diaporama, zones et frais de livraison, moyens de paiement, boutique (adresse, GPS, horaires), notifications |
| `index.html` | Structure et textes de la page d'accueil |
| `styles.css` | Apparence (couleurs en haut du fichier : mode clair, puis mode sombre) |
| `script.js` | Panier, recherche, catégories, diaporama, formulaires, notifications, service client |
| `cafe-3d.js` | Grains de café en 3D qui descendent au défilement (Three.js) |
| `livraison.html` | Politique de livraison |
| `confidentialite.html` | Politique de confidentialité (loi ivoirienne n° 2013-450) |
| `mentions-legales.html` | Mentions légales (**à compléter** : RCCM, NCC, hébergeur) |
| `legal.js` | Remplit les pages légales avec les informations de `config.js` |
| `images/` | Logo, sachets de café, illustrations du diaporama, boutique, icônes |
| `fonts/` | Police Open Sauce Sans (licence SIL OFL) |
| `vendor/` | Bibliothèque 3D Three.js (licence MIT) |

## Fonctionnalités

- **Bandeau d'annonce** tout en haut, dont les messages défilent (`announcements`).
- **En-tête** : menu hamburger (mobile), recherche avec suggestions (insensible aux accents),
  notifications, panier avec compteur, bascule clair/sombre, barre de catégories.
- **Haut de page** : diaporama de textes (pause, flèches, points, glissement) et un grand
  **grain de café en 3D** posé sur un disque, avec des étiquettes que l'on peut déplacer.
  En descendant, le grain rétrécit, tourne et se pose dans la marge, en changeant de côté à
  chaque section (`cafe-3d.js`). Sans 3D (ou si moins d'animations est demandé), une image fixe
  du grain s'affiche.
- **Catégories en tuiles**, **boutique** filtrable et triable (prix, intensité).
- **Offre de la semaine** avec compte à rebours ; la remise s'applique automatiquement (`offer`).
- **Quiz « Trouvez votre café »** : 3 questions, une recommandation selon les profils
  aromatiques des cafés (`tags`) et la mouture conseillée.
- **Coffret découverte** : 3 cafés de 250 g au choix, −10 % (`coffret`).
- **De la cerise à la tasse** : les étapes, avec une ligne qui se trace au défilement.
- **Paiement** : logos Orange Money, MTN MoMo, Moov Money, Djamo, Visa (`images/paiement/`).
- **Devis entreprises** avec estimation, **renseignements**, **carte**, **service client**
  (section + bulle flottante avec statut en ligne), **FAQ**.
- **Animations** : grain qui vole vers le panier, pluie de grains après une commande,
  boutons « magnétiques », cartes qui s'inclinent, titres qui apparaissent mot par mot,
  chiffres du compte à rebours qui basculent… Et un petit secret : cliquez 5 fois sur le logo.

Aucun paiement n'est effectué sur le site : le règlement (Mobile Money, espèces, carte en
boutique) se fait après confirmation de la commande sur WhatsApp.

## Personnaliser

- **Cafés** : dans `config.js`, `products`. Chaque café a une photo carrée (`image`).
- **Photos** : déposez vos fichiers dans `images/` (JPG ou WebP, 1600 px max, < 300 Ko) et
  changez les chemins dans `config.js`.
- **Diaporama** : `slides` (titre, texte, bouton) et `slideDelay` (durée en ms).
- **Livraison** : `delivery.zones` (commune + frais) et `delivery.freeFrom`.
- **Carte** : `shop.lat` / `shop.lng` (clic droit sur Google Maps → copier les coordonnées).
- **Notifications** : `notifications`. Changez l'`id` d'une annonce pour qu'elle réapparaisse
  comme non lue.
- **Statut « en ligne »** : `shop.support` (horaires du service client, heure d'Abidjan).

## Voir le site en local

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

La 3D ne s'affiche pas si on ouvre `index.html` par double-clic : utilisez la commande ci-dessus.

## Mise en ligne

- **Netlify** : netlify.com → « Add new site » → « Import from GitHub » → ce dépôt → Deploy.
- **GitHub Pages** : Settings → Pages → choisir la branche → Save.

Après la mise en ligne, remplacez `images/partage.png` dans la balise `og:image` de
`index.html` par l'adresse complète (ex. `https://aubecafe.ci/images/partage.png`) pour que
l'aperçu s'affiche bien sur WhatsApp et Facebook.
