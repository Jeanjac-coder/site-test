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
| `mentions-legales.html` | Mentions légales et confidentialité (**à compléter**) |

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
