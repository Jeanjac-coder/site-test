/*
 * ============================================================
 *  CONFIGURATION DU SITE — c'est le seul fichier à modifier
 *  pour personnaliser le contenu (nom, numéro, cafés, prix…).
 *  Les valeurs marquées « EXEMPLE » sont à remplacer.
 * ============================================================
 */
window.SITE_CONFIG = {
  // Nom de votre business (affiché dans l'en-tête, le pied de page et les messages WhatsApp)
  brand: "Aube Café",

  // Numéro WhatsApp au format international, SANS "+" et SANS espaces.
  // Côte d'Ivoire : on GARDE le 0 du numéro à 10 chiffres.
  // +225 05 01 49 24 04  ->  "2250501492404"
  whatsapp: "2250501492404",
  email: "contact@aubecafe.ci", // EXEMPLE

  // Images du site. Pour utiliser vos photos : déposez-les dans le dossier "images/"
  // puis remplacez le chemin, par ex. "images/ma-photo.jpg".
  // Conseils : JPG ou WebP, 1600 px de large maximum, moins de 300 Ko.
  images: {
    logo: "images/logo.svg",             // logo de l'en-tête et du pied de page
    logoSombre: "images/logo-blanc.svg", // version du logo pour le mode sombre
    boutique: "images/boutique.svg"      // photo de la boutique (format paysage 4:3)
  },

  // Devise et format des prix (XOF = franc CFA)
  currency: "XOF",
  locale: "fr-CI",

  // ---------- Bandeau d'annonce (tout en haut, les messages défilent) ----------
  announcements: [
    "🛵 Livraison offerte dès 20 000 F CFA partout à Abidjan",
    "☕ Torréfié chaque semaine, ici même à Abidjan",
    "📱 Payez par Orange Money, MTN MoMo, Moov Money, Wave ou Djamo",
    "🎁 Coffret découverte : 3 cafés, −10 % sur le tout"
  ],

  // ---------- Diaporama du haut de page (défile automatiquement) ----------
  slides: [
    {
      eyebrow: "Akwaba chez Aube Café",
      title: "Le café qui réveille Babi.",
      text: "Du robusta de nos terres aux plus grands crus du monde, torréfiés chaque semaine à Abidjan. Une tasse, et la journée est lancée.",
      cta: "Découvrir nos cafés", href: "#cafes"
    },
    {
      eyebrow: "Quatorze cafés",
      title: "Le tour du monde, sans quitter Abidjan.",
      text: "Éthiopie, Colombie, Jamaïque, Panama… Chaque origine raconte son terroir. Nous les sélectionnons avec exigence pour votre tasse.",
      cta: "Trouver mon café", href: "#quiz"
    },
    {
      eyebrow: "Livraison en 24 h",
      title: "On vous livre à la maison, ça va aller vite.",
      text: "Commandez en une minute sur WhatsApp, réglez par Mobile Money ou à la livraison. De Cocody à Yopougon, nous arrivons.",
      cta: "Commander maintenant", href: "#cafes"
    },
    {
      eyebrow: "Entreprises & événements",
      title: "Le bon café pour vos bureaux et vos fêtes.",
      text: "Bureaux, hôtels, restaurants, mariages, séminaires : recevez un devis sur mesure, avec des tarifs dégressifs selon les volumes.",
      cta: "Demander un devis", href: "#devis"
    }
  ],
  slideDelay: 6000, // durée d'affichage de chaque diapositive, en millisecondes

  // ---------- Catégories (filtres au-dessus des cafés) ----------
  categories: [
    { id: "cote-ivoire", label: "Côte d'Ivoire" },
    { id: "afrique", label: "Afrique" },
    { id: "ameriques", label: "Amériques" },
    { id: "asie", label: "Asie & Océanie" },
    { id: "assemblages", label: "Assemblages" },
    { id: "prestige", label: "Grands crus" }
  ],

  // Moutures proposées pour chaque café
  grinds: ["En grains", "Espresso", "Filtre", "Piston", "Moka"],

  // ---------- Cafés — EXEMPLES de prix ----------
  // "id" unique · "categories" : identifiants de la liste ci-dessus
  // "price" = prix pour le format indiqué dans "size" · "image" : photo carrée
  // "tags" (pour le quiz) : intense, doux, lait, filtre, chocolat, caramel, fruite, floral, epices, rare
  products: [
    {
      id: "robusta-ci", name: "Robusta de Côte d'Ivoire", origin: "Côte d'Ivoire",
      categories: ["cote-ivoire", "afrique"], notes: "Cacao · Épices · Corsé et généreux",
      roast: "Torréfaction foncée", intensity: 5, size: "250 g", price: 3500,
      image: "images/cafes/robusta-ci.webp", badge: "Fierté locale",
      tags: "intense lait epices chocolat"
    },
    {
      id: "maison", name: "Assemblage Maison", origin: "Côte d'Ivoire & Brésil",
      categories: ["assemblages", "cote-ivoire"], notes: "Robusta ivoirien & arabica · Crème épaisse",
      roast: "Torréfaction moyenne-foncée", intensity: 4, size: "1 kg", price: 18000,
      image: "images/cafes/maison.svg", badge: "Format éco",
      tags: "intense lait chocolat"
    },
    {
      id: "ethiopie", name: "Éthiopie Yirgacheffe", origin: "Éthiopie",
      categories: ["afrique"], notes: "Agrumes · Jasmin · Thé noir",
      roast: "Torréfaction claire", intensity: 2, size: "250 g", price: 7500,
      image: "images/cafes/ethiopie.svg", badge: "Coup de cœur",
      tags: "fruite floral doux filtre"
    },
    {
      id: "kenya", name: "Kenya AA Nyeri", origin: "Kenya",
      categories: ["afrique"], notes: "Cassis · Pamplemousse · Vif et juteux",
      roast: "Torréfaction claire", intensity: 3, size: "250 g", price: 8500,
      image: "images/cafes/kenya.svg",
      tags: "fruite filtre"
    },
    {
      id: "rwanda", name: "Rwanda Bourbon", origin: "Rwanda",
      categories: ["afrique"], notes: "Fruits rouges · Caramel · Délicat",
      roast: "Torréfaction moyenne", intensity: 3, size: "250 g", price: 7000,
      image: "images/cafes/rwanda.svg",
      tags: "fruite caramel doux filtre"
    },
    {
      id: "bresil", name: "Brésil Cerrado", origin: "Brésil",
      categories: ["ameriques"], notes: "Chocolat · Amande · Rond en bouche",
      roast: "Torréfaction moyenne", intensity: 3, size: "250 g", price: 6000,
      image: "images/cafes/bresil.svg",
      tags: "chocolat doux lait"
    },
    {
      id: "colombie", name: "Colombie Huila", origin: "Colombie",
      categories: ["ameriques"], notes: "Caramel · Pomme rouge · Noisette",
      roast: "Torréfaction moyenne", intensity: 3, size: "250 g", price: 6500,
      image: "images/cafes/colombie.svg",
      tags: "caramel doux lait filtre"
    },
    {
      id: "guatemala", name: "Guatemala Antigua", origin: "Guatemala",
      categories: ["ameriques"], notes: "Cacao · Épices douces · Fumé léger",
      roast: "Torréfaction moyenne-foncée", intensity: 4, size: "250 g", price: 7000,
      image: "images/cafes/guatemala.svg",
      tags: "chocolat epices intense"
    },
    {
      id: "costa-rica", name: "Costa Rica Tarrazú", origin: "Costa Rica",
      categories: ["ameriques"], notes: "Miel · Agrumes · Très équilibré",
      roast: "Torréfaction moyenne", intensity: 3, size: "250 g", price: 7500,
      image: "images/cafes/costa-rica.svg",
      tags: "caramel fruite doux filtre"
    },
    {
      id: "perou", name: "Pérou Bio Cajamarca", origin: "Pérou",
      categories: ["ameriques"], notes: "Noisette · Vanille · Doux",
      roast: "Torréfaction moyenne", intensity: 2, size: "250 g", price: 6500,
      image: "images/cafes/perou.svg", badge: "Bio",
      tags: "doux caramel lait"
    },
    {
      id: "jamaique", name: "Jamaïque Blue Mountain", origin: "Jamaïque",
      categories: ["ameriques", "prestige"], notes: "Velouté · Floral · D'une rare douceur",
      roast: "Torréfaction moyenne", intensity: 2, size: "250 g", price: 22000,
      image: "images/cafes/jamaique.svg", badge: "Grand cru",
      tags: "rare doux floral"
    },
    {
      id: "panama", name: "Panama Geisha", origin: "Panama",
      categories: ["ameriques", "prestige"], notes: "Bergamote · Jasmin · Pêche blanche",
      roast: "Torréfaction claire", intensity: 1, size: "100 g", price: 15000,
      image: "images/cafes/panama.svg", badge: "Édition limitée",
      tags: "rare floral fruite filtre"
    },
    {
      id: "sumatra", name: "Indonésie Sumatra Mandheling", origin: "Indonésie",
      categories: ["asie"], notes: "Terre · Cèdre · Chocolat noir",
      roast: "Torréfaction foncée", intensity: 5, size: "250 g", price: 7000,
      image: "images/cafes/sumatra.svg",
      tags: "intense epices chocolat lait"
    },
    {
      id: "inde", name: "Inde Monsooned Malabar", origin: "Inde",
      categories: ["asie"], notes: "Épices · Boisé · Faible acidité",
      roast: "Torréfaction moyenne-foncée", intensity: 4, size: "250 g", price: 6000,
      image: "images/cafes/inde.svg",
      tags: "epices intense lait"
    }
  ],

  // ---------- Livraison — EXEMPLE ----------
  // Frais selon la commune. Livraison offerte dès "freeFrom" (null pour désactiver).
  delivery: {
    freeFrom: 20000,
    zones: [
      { name: "Cocody", fee: 1000 },
      { name: "Plateau", fee: 1500 },
      { name: "Adjamé", fee: 1500 },
      { name: "Marcory", fee: 1500 },
      { name: "Treichville", fee: 1500 },
      { name: "Koumassi", fee: 1500 },
      { name: "Attécoubé", fee: 1500 },
      { name: "Yopougon", fee: 2000 },
      { name: "Abobo", fee: 2000 },
      { name: "Port-Bouët", fee: 2000 },
      { name: "Bingerville", fee: 2500 },
      { name: "Songon", fee: 3000 },
      { name: "Anyama", fee: 3000 },
      { name: "Grand-Bassam", fee: 3500 }
    ],
    delay: "24 h ouvrées à Abidjan, du lundi au samedi"
  },

  // ---------- Moyens de paiement acceptés en Côte d'Ivoire ----------
  // "logo" : image dans images/paiement/ (sinon un badge coloré est affiché)
  payments: [
    { id: "orange", name: "Orange Money", logo: "images/paiement/orange-money.jpg", color: "#ff7900", ink: "#000" },
    { id: "mtn", name: "MTN MoMo", logo: "images/paiement/mtn-momo.jpg", color: "#ffcc00", ink: "#004f71" },
    { id: "moov", name: "Moov Money", logo: "images/paiement/moov-money.jpg", color: "#0066b3", ink: "#fff" },
    { id: "wave", name: "Wave", color: "#1dc8f2", ink: "#ffffff" },
    { id: "djamo", name: "Djamo", logo: "images/paiement/djamo.jpg", color: "#1a1a1a", ink: "#fff" },
    { id: "visa", name: "Carte Visa", logo: "images/paiement/visa.jpg", color: "#1a1f71", ink: "#fff", note: "en boutique" },
    { id: "especes", name: "Espèces à la livraison", color: "#2e7d4f", ink: "#fff" }
  ],

  // ---------- Offre de la semaine — EXEMPLE ----------
  // Remise appliquée automatiquement au café choisi jusqu'à la date de fin (heure d'Abidjan = GMT).
  // Mettez offer: null pour masquer la section.
  offer: {
    productId: "kenya",
    discount: 0.15,
    endsAt: "2026-10-31T23:59:00Z",
    title: "Le Kenya AA à −15 %",
    text: "Un café vif et juteux, aux notes de cassis et de pamplemousse. Idéal en filtre pour bien commencer la matinée."
  },

  // ---------- Coffret découverte ----------
  coffret: { size: 3, discount: 0.1 }, // 3 cafés au choix (formats 250 g), −10 %

  // ---------- Boutique physique — EXEMPLE ----------
  shop: {
    address: "Rue des Jardins, Cocody Deux-Plateaux, Abidjan",
    phoneDisplay: "+225 05 01 49 24 04",
    // Coordonnées GPS de la boutique (pour la carte). Clic droit sur Google Maps → copier les coordonnées.
    lat: 5.3698,
    lng: -3.9935,
    // Horaires affichés
    hours: [
      ["Lundi – Vendredi", "7h00 – 19h00"],
      ["Samedi", "8h00 – 19h00"],
      ["Dimanche", "9h00 – 14h00"]
    ],
    // Horaires du service client (heure d'Abidjan), utilisés pour afficher « En ligne / Hors ligne ».
    // 0 = dimanche, 1 = lundi … 6 = samedi : [heure d'ouverture, heure de fermeture]
    support: { 0: [9, 14], 1: [7, 19], 2: [7, 19], 3: [7, 19], 4: [7, 19], 5: [7, 19], 6: [8, 19] }
  },

  // ---------- Notifications (cloche de l'en-tête) ----------
  // Changez "id" à chaque nouvelle annonce pour qu'elle apparaisse comme non lue.
  notifications: [
    { id: "n-geisha", title: "Nouveauté : Panama Geisha", text: "Édition limitée, l'un des cafés les plus rares au monde. Les quantités sont comptées." },
    { id: "n-livraison", title: "Livraison offerte dès 20 000 F", text: "Partout à Abidjan, du lundi au samedi." },
    { id: "n-dimanche", title: "Ouvert le dimanche matin", text: "La boutique vous accueille de 9 h à 14 h." }
  ],

  // Avis clients : laissez vide tant que vous n'avez pas de VRAIS avis.
  // Exemple : { name: "Awa", text: "Le meilleur café d'Abidjan !" }
  reviews: []
};
