# Aube Café — landing page

Landing page d'Aube Café, Abidjan (boutique physique + vente en ligne), avec commande via WhatsApp.
Site 100 % statique : HTML, CSS et JavaScript, sans installation ni serveur.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.js` | **À modifier** : nom, numéro WhatsApp, cafés, prix, livraison, adresse, horaires, avis |
| `index.html` | Structure et textes de la page |
| `styles.css` | Apparence (couleurs et polices en haut du fichier, dans `:root`) |
| `script.js` | Panier et génération du message WhatsApp |
| `images/` | Logo, illustrations et icônes (voir ci-dessous) |
| `cafe-3d.js` | Grains de café en 3D qui descendent au défilement (Three.js) |
| `vendor/` | Bibliothèque 3D Three.js (licence MIT) |
| `fonts/` | Police Open Sauce Sans hébergée avec le site (licence libre SIL OFL) |
| `mentions-legales.html` | Mentions légales et confidentialité (**à compléter**) |

## Images

| Fichier | Où il apparaît |
|---|---|
| `images/logo.svg` | En-tête et pied de page (`logo-blanc.svg` : version pour fond sombre) |
| `images/favicon.svg`, `images/apple-touch-icon.png` | Icône de l'onglet et de l'écran d'accueil du téléphone |
| `images/accueil.svg` | Grande image en haut de page |
| `images/cafes/*.svg` | Photos des cafés (une par produit) |
| `images/boutique.svg` | Photo de la boutique |
| `images/partage.png` | Aperçu affiché quand le lien est partagé sur WhatsApp, Facebook… |

Les images actuelles sont des illustrations provisoires. Pour mettre vos photos : déposez-les
dans `images/` (JPG ou WebP, 1600 px de large maximum, moins de 300 Ko) puis changez le chemin
dans `config.js` (`images` pour l'accueil, le logo et la boutique ; `image` pour chaque café).
Formats conseillés : carré pour les cafés, paysage 4:3 pour la boutique.

Après la mise en ligne, remplacez `images/partage.png` dans la balise `og:image` de `index.html`
par l'adresse complète (ex. `https://aubecafe.ci/images/partage.png`) pour que l'aperçu
s'affiche bien sur WhatsApp et Facebook.

## Mode sombre

Le site suit automatiquement le réglage clair/sombre du téléphone ou de l'ordinateur du visiteur.
Le bouton ☀️/🌙 de l'en-tête permet de forcer l'un ou l'autre ; ce choix est mémorisé.
Les couleurs du mode sombre se modifient dans `styles.css`, bloc « Mode sombre » en haut du fichier.
Le logo utilisé en mode sombre est `images/logo-blanc.svg` (réglable dans `config.js`, `logoSombre`).

## Grains de café en 3D

`cafe-3d.js` affiche des grains de café en 3D dans les marges de la page ; ils tombent et tournent
quand on fait défiler. La scène se charge après l'affichage de la page pour ne pas la ralentir.
Elle est automatiquement désactivée si le visiteur a demandé moins d'animations ou si son appareil
ne gère pas la 3D. Réglages dans `cafe-3d.js` : nombre de grains (`count`), taille (`scale`),
vitesse de chute (`speed`).

Note : la 3D ne s'affiche pas si on ouvre `index.html` par double-clic ; utilisez le serveur local
ci-dessous (ou la version en ligne).

## Voir le site en local

Ouvrez `index.html` dans votre navigateur (double-clic), ou lancez :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Avant la mise en ligne

1. Le numéro WhatsApp est déjà configuré dans `config.js` (`2250501492404` = +225 05 01 49 24 04).
2. Remplacez les valeurs marquées « EXEMPLE » dans `config.js` : cafés, prix (en FCFA), livraison, adresse et horaires.
3. Complétez `mentions-legales.html` (RCCM, NCC, e-mail).
4. Changez le titre et la description dans le `<head>` de `index.html` (référencement Google).

## Mise en ligne gratuite

- **Netlify** : netlify.com → « Add new site » → « Import from GitHub » → choisir ce dépôt → Deploy.
- **GitHub Pages** : Settings → Pages → Branch `main` → Save.

Puis reliez votre nom de domaine dans les réglages de l'hébergeur.
