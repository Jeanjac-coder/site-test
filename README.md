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
