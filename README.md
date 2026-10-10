# Aube Café — landing page

Landing page de vente de café (boutique physique + vente en ligne), avec commande via WhatsApp.
Site 100 % statique : HTML, CSS et JavaScript, sans installation ni serveur.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.js` | **À modifier** : nom, numéro WhatsApp, cafés, prix, livraison, adresse, horaires, avis |
| `index.html` | Structure et textes de la page |
| `styles.css` | Apparence (couleurs et polices en haut du fichier, dans `:root`) |
| `script.js` | Panier et génération du message WhatsApp |
| `mentions-legales.html` | Mentions légales et confidentialité (**à compléter**) |

## Voir le site en local

Ouvrez `index.html` dans votre navigateur (double-clic), ou lancez :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Avant la mise en ligne

1. Dans `config.js`, remplacez `whatsapp` par votre numéro (ex. `33612345678` pour 06 12 34 56 78).
2. Remplacez le nom, les cafés, les prix, l'adresse et les horaires.
3. Complétez `mentions-legales.html` (obligatoire en France).
4. Changez le titre et la description dans le `<head>` de `index.html` (référencement Google).

## Mise en ligne gratuite

- **Netlify** : netlify.com → « Add new site » → « Import from GitHub » → choisir ce dépôt → Deploy.
- **GitHub Pages** : Settings → Pages → Branch `main` → Save.

Puis reliez votre nom de domaine dans les réglages de l'hébergeur.
