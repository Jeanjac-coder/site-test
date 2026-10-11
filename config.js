/*
 * ============================================================
 *  CONFIGURATION DU SITE AUBE CAFÉ
 *  C'est le seul fichier à modifier pour personnaliser le contenu.
 *  Les valeurs marquées « EXEMPLE » sont à vérifier ou remplacer.
 * ============================================================
 */
window.SITE_CONFIG = {
  brand: "Aube Café",
  url: "https://aubecafe.ci", // EXEMPLE : adresse définitive du site (utile au référencement)

  // WhatsApp au format international, sans "+" ni espaces (Côte d'Ivoire : on garde le 0).
  whatsapp: "2250501492404",
  phoneDisplay: "+225 05 01 49 24 04",
  email: "contact@aubecafe.ci", // EXEMPLE

  currency: "XOF",
  locale: "fr-CI",

  // Réseaux sociaux : renseignez l'adresse complète de vos pages (laisser "" si pas de compte).
  socials: {
    instagram: "",
    facebook: "",
    tiktok: "",
    linkedin: ""
  },

  images: {
    logo: "images/logo.svg",
    logoSombre: "images/logo-blanc.svg"
  },

  // ---------- Bandeau promotionnel (haut de page) ----------
  announcements: [
    { fr: "Livraison offerte dès 20 000 F CFA partout à Abidjan", en: "Free delivery from 20,000 CFA anywhere in Abidjan" },
    { fr: "Torréfié chaque semaine, ici à Abidjan", en: "Roasted every week, right here in Abidjan" },
    { fr: "Orange Money, MTN MoMo, Wave : payez comme ça vous arrange", en: "Orange Money, MTN MoMo, Wave: pay the way you like" }
  ],

  // ---------- Diaporama plein écran ----------
  slides: [
    {
      image: "images/hero/hero-1",
      eyebrow: { fr: "Torréfié à Abidjan", en: "Roasted in Abidjan" },
      title: { fr: "Le vrai café qui met tout le monde d'accord.", en: "The real coffee everyone agrees on." },
      text: { fr: "Quinze origines d'exception, torréfiées chaque semaine en petites quantités. Du bon café, sans palabres.", en: "Fifteen exceptional origins, roasted every week in small batches. Good coffee, no fuss." },
      cta: { fr: "Découvrir la collection", en: "Explore the collection" }, href: "#boutique"
    },
    {
      image: "images/hero/hero-2",
      eyebrow: { fr: "Le rituel du matin", en: "The morning ritual" },
      title: { fr: "Le goût qui fait plaisir jusqu'au dernier grain.", en: "A taste that delights to the very last bean." },
      text: { fr: "Moulu pour votre machine, livré en 24 heures. Il ne vous reste qu'à savourer.", en: "Ground for your machine, delivered within 24 hours. All that's left is to enjoy it." },
      cta: { fr: "Trouver mon café", en: "Find my coffee" }, href: "#assistant"
    },
    {
      image: "images/hero/hero-3",
      eyebrow: { fr: "Entreprises & événements", en: "Business & events" },
      title: { fr: "On ne joue pas avec un bon café.", en: "We don't play around with good coffee." },
      text: { fr: "Bureaux, hôtels, restaurants, mariages : un devis sur mesure en moins de 24 heures.", en: "Offices, hotels, restaurants, weddings: a tailored quote in under 24 hours." },
      cta: { fr: "Demander un devis", en: "Request a quote" }, href: "#devis"
    }
  ],
  slideDelay: 6500,

  // ---------- Offre du moment (EXEMPLE) — remise appliquée automatiquement jusqu'à la date de fin ----------
  offer: {
    productId: "kenya",
    discount: 0.15,
    endsAt: "2026-11-30T23:59:00Z",
    title: { fr: "Kenya AA Nyeri à −15 %", en: "Kenya AA Nyeri −15%" }
  },

  // ---------- Familles de cafés ----------
  // continent : afrique | ameriques | asie · roast : light | medium | medium-dark | dark
  // intensity, acidity, body : de 1 à 5 · methods : espresso, filtre, piston, moka, cafetiere
  // badges : new (Nouveauté), best (Meilleure vente) — EXEMPLES à ajuster selon vos ventes réelles
  // stock : quantité disponible (EXEMPLE) · reviews : uniquement de VRAIS avis clients
  products: [
    {
      id: "ethiopie", name: "Éthiopie Yirgacheffe", country: "Éthiopie", country_en: "Ethiopia", continent: "afrique",
      region: "Yirgacheffe, Gedeo", altitude: "1 900 – 2 200 m", variety: "Heirloom", process: { fr: "Lavé", en: "Washed" },
      roast: "light", intensity: 2, acidity: 5, body: 2, methods: ["filtre", "piston"],
      notes: { fr: "Agrumes, jasmin, thé noir", en: "Citrus, jasmine, black tea" },
      story: { fr: "Le berceau du café dans toute sa finesse : une tasse florale et lumineuse, qui se boit comme un grand thé.", en: "The birthplace of coffee at its finest: a floral, luminous cup that drinks like a fine tea." },
      price: 7500, size: "250 g", stock: 24, badges: ["best"], tags: "fruite floral doux filtre",
      image: "images/produits/ethiopie.webp", reviews: []
    },
    {
      id: "colombie", name: "Colombie Huila", country: "Colombie", country_en: "Colombia", continent: "ameriques",
      region: "Huila", altitude: "1 600 – 1 900 m", variety: "Caturra, Castillo", process: { fr: "Lavé", en: "Washed" },
      roast: "medium", intensity: 3, acidity: 3, body: 3, methods: ["espresso", "filtre", "cafetiere"],
      notes: { fr: "Caramel, pomme rouge, noisette", en: "Caramel, red apple, hazelnut" },
      story: { fr: "Rond, gourmand, d'une régularité exemplaire : le café qui plaît à toute la maison.", en: "Round, indulgent and remarkably consistent: the coffee the whole household loves." },
      price: 6500, size: "250 g", stock: 40, badges: ["best"], tags: "caramel doux lait filtre",
      image: "images/produits/colombie.webp", reviews: []
    },
    {
      id: "bresil", name: "Brésil Cerrado", country: "Brésil", country_en: "Brazil", continent: "ameriques",
      region: "Cerrado Mineiro", altitude: "1 000 – 1 200 m", variety: "Mundo Novo, Catuaí", process: { fr: "Nature", en: "Natural" },
      roast: "medium", intensity: 3, acidity: 2, body: 4, methods: ["espresso", "moka", "cafetiere"],
      notes: { fr: "Chocolat au lait, amande, rond", en: "Milk chocolate, almond, round" },
      story: { fr: "Une douceur chocolatée et une belle onctuosité : parfait en espresso comme avec un nuage de lait.", en: "Chocolatey sweetness and lovely smoothness: perfect as an espresso or with a dash of milk." },
      price: 6000, size: "250 g", stock: 36, badges: [], tags: "chocolat doux lait",
      image: "images/produits/bresil.webp", reviews: []
    },
    {
      id: "guatemala", name: "Guatemala Antigua", country: "Guatemala", country_en: "Guatemala", continent: "ameriques",
      region: "Antigua", altitude: "1 500 – 1 700 m", variety: "Bourbon", process: { fr: "Lavé", en: "Washed" },
      roast: "medium-dark", intensity: 4, acidity: 3, body: 4, methods: ["espresso", "piston", "moka"],
      notes: { fr: "Cacao, épices douces, fumé léger", en: "Cocoa, soft spices, light smoke" },
      story: { fr: "Né au pied des volcans, un café de caractère aux notes de cacao, profond et élégant.", en: "Born at the foot of volcanoes, a characterful coffee with cocoa notes, deep and elegant." },
      price: 7000, size: "250 g", stock: 18, badges: [], tags: "chocolat epices intense",
      image: "images/produits/guatemala.webp", reviews: []
    },
    {
      id: "kenya", name: "Kenya AA Nyeri", country: "Kenya", country_en: "Kenya", continent: "afrique",
      region: "Nyeri", altitude: "1 700 – 1 900 m", variety: "SL28, SL34", process: { fr: "Lavé", en: "Washed" },
      roast: "light", intensity: 3, acidity: 5, body: 3, methods: ["filtre", "piston"],
      notes: { fr: "Cassis, pamplemousse, vif et juteux", en: "Blackcurrant, grapefruit, bright and juicy" },
      story: { fr: "Une explosion de fruits rouges et une vivacité inoubliable. Le café qui réveille les papilles.", en: "A burst of red fruit and unforgettable brightness. The coffee that wakes up your taste buds." },
      price: 8500, size: "250 g", stock: 12, badges: [], tags: "fruite filtre",
      image: "images/produits/kenya.webp", reviews: []
    },
    {
      id: "costa-rica", name: "Costa Rica Tarrazú", country: "Costa Rica", country_en: "Costa Rica", continent: "ameriques",
      region: "Tarrazú", altitude: "1 400 – 1 900 m", variety: "Caturra, Catuaí", process: { fr: "Honey", en: "Honey" },
      roast: "medium", intensity: 3, acidity: 4, body: 3, methods: ["filtre", "espresso"],
      notes: { fr: "Miel, agrumes, très équilibré", en: "Honey, citrus, beautifully balanced" },
      story: { fr: "Un équilibre parfait entre douceur et éclat, travaillé selon la méthode « honey ».", en: "A perfect balance of sweetness and brightness, processed using the honey method." },
      price: 7500, size: "250 g", stock: 20, badges: [], tags: "caramel fruite doux filtre",
      image: "images/produits/costa-rica.webp", reviews: []
    },
    {
      id: "jamaique", name: "Jamaïque Blue Mountain", country: "Jamaïque", country_en: "Jamaica", continent: "ameriques",
      region: "Blue Mountains", altitude: "900 – 1 700 m", variety: "Typica", process: { fr: "Lavé", en: "Washed" },
      roast: "medium", intensity: 2, acidity: 2, body: 3, methods: ["filtre", "piston"],
      notes: { fr: "Velouté, floral, d'une rare douceur", en: "Velvety, floral, rare smoothness" },
      story: { fr: "L'un des cafés les plus recherchés au monde. Une douceur soyeuse, sans aucune amertume.", en: "One of the world's most sought-after coffees. Silky smoothness, no bitterness at all." },
      price: 22000, size: "250 g", stock: 6, badges: [], tags: "rare doux floral",
      image: "images/produits/jamaique.webp", reviews: []
    },
    {
      id: "vietnam", name: "Vietnam Đà Lạt", country: "Vietnam", country_en: "Vietnam", continent: "asie",
      region: "Lâm Đồng", altitude: "1 400 – 1 600 m", variety: "Robusta, Arabica", process: { fr: "Nature", en: "Natural" },
      roast: "dark", intensity: 5, acidity: 1, body: 5, methods: ["espresso", "moka", "cafetiere"],
      notes: { fr: "Chocolat noir, caramel brûlé, corsé", en: "Dark chocolate, burnt caramel, bold" },
      story: { fr: "Intense et généreux, idéal pour un café glacé ou un vrai café au lait concentré sucré.", en: "Intense and generous, ideal for iced coffee or a classic with sweetened condensed milk." },
      price: 5500, size: "250 g", stock: 30, badges: ["new"], tags: "intense lait chocolat",
      image: "images/produits/vietnam.webp", reviews: []
    },
    {
      id: "perou", name: "Pérou Cajamarca Bio", country: "Pérou", country_en: "Peru", continent: "ameriques",
      region: "Cajamarca", altitude: "1 600 – 2 000 m", variety: "Typica, Caturra", process: { fr: "Lavé · Bio", en: "Washed · Organic" },
      roast: "medium", intensity: 2, acidity: 3, body: 3, methods: ["filtre", "cafetiere", "piston"],
      notes: { fr: "Noisette, vanille, doux", en: "Hazelnut, vanilla, mellow" },
      story: { fr: "Issu de l'agriculture biologique, un café tout en douceur pour les matins tranquilles.", en: "Organically grown, a gentle coffee for slow mornings." },
      price: 6500, size: "250 g", stock: 22, badges: [], tags: "doux caramel lait",
      image: "images/produits/perou.webp", reviews: []
    },
    {
      id: "sumatra", name: "Indonésie Sumatra Mandheling", country: "Indonésie", country_en: "Indonesia", continent: "asie",
      region: "Sumatra du Nord", altitude: "1 100 – 1 500 m", variety: "Typica, Catimor", process: { fr: "Semi-lavé", en: "Wet-hulled" },
      roast: "dark", intensity: 5, acidity: 1, body: 5, methods: ["espresso", "piston", "moka"],
      notes: { fr: "Terre, cèdre, chocolat noir", en: "Earth, cedar, dark chocolate" },
      story: { fr: "Un café puissant et boisé, au corps sirupeux. Pour ceux qui aiment quand ça tient.", en: "A powerful, woody coffee with a syrupy body. For those who like it strong." },
      price: 7000, size: "250 g", stock: 15, badges: [], tags: "intense epices chocolat lait",
      image: "images/produits/sumatra.webp", reviews: []
    },
    {
      id: "robusta-ci", name: "Robusta de Côte d'Ivoire", country: "Côte d'Ivoire", country_en: "Côte d'Ivoire", continent: "afrique",
      region: "Ouest ivoirien", altitude: "300 – 600 m", variety: "Robusta", process: { fr: "Nature", en: "Natural" },
      roast: "dark", intensity: 5, acidity: 1, body: 5, methods: ["espresso", "moka", "cafetiere"],
      notes: { fr: "Cacao, épices, corsé et généreux", en: "Cocoa, spices, bold and generous" },
      story: { fr: "La fierté de chez nous. Un café franc, intense, à la crème épaisse : le réveil à l'ivoirienne.", en: "Our home-grown pride. A frank, intense coffee with a thick crema: the Ivorian wake-up call." },
      price: 3500, size: "250 g", stock: 60, badges: ["best"], tags: "intense lait epices chocolat",
      image: "images/cafes/robusta-ci.webp", gallery: ["images/produits/robusta-ci.webp"], reviews: []
    },
    {
      id: "rwanda", name: "Rwanda Bourbon", country: "Rwanda", country_en: "Rwanda", continent: "afrique",
      region: "Lac Kivu", altitude: "1 500 – 2 000 m", variety: "Red Bourbon", process: { fr: "Lavé", en: "Washed" },
      roast: "medium", intensity: 3, acidity: 4, body: 3, methods: ["filtre", "piston"],
      notes: { fr: "Fruits rouges, caramel, délicat", en: "Red berries, caramel, delicate" },
      story: { fr: "Des collines du lac Kivu, une tasse délicate et fruitée, d'une grande pureté.", en: "From the hills of Lake Kivu, a delicate, fruity cup of great purity." },
      price: 7000, size: "250 g", stock: 14, badges: ["new"], tags: "fruite caramel doux filtre",
      image: "images/produits/rwanda.webp", reviews: []
    },
    {
      id: "panama", name: "Panama Geisha", country: "Panama", country_en: "Panama", continent: "ameriques",
      region: "Boquete", altitude: "1 600 – 1 800 m", variety: "Geisha", process: { fr: "Lavé", en: "Washed" },
      roast: "light", intensity: 1, acidity: 4, body: 2, methods: ["filtre"],
      notes: { fr: "Bergamote, jasmin, pêche blanche", en: "Bergamot, jasmine, white peach" },
      story: { fr: "Un grand cru d'exception, aux arômes de thé et de fleurs blanches. Une expérience rare.", en: "An exceptional grand cru with tea and white-flower aromas. A rare experience." },
      price: 15000, size: "100 g", stock: 5, badges: ["new"], tags: "rare floral fruite filtre",
      image: "images/produits/panama.webp", reviews: []
    },
    {
      id: "inde", name: "Inde Monsooned Malabar", country: "Inde", country_en: "India", continent: "asie",
      region: "Côte de Malabar", altitude: "1 000 – 1 500 m", variety: "Kents, S795", process: { fr: "Moussonné", en: "Monsooned" },
      roast: "medium-dark", intensity: 4, acidity: 1, body: 4, methods: ["espresso", "moka"],
      notes: { fr: "Épices, boisé, très faible acidité", en: "Spices, wood, very low acidity" },
      story: { fr: "Exposé aux vents de la mousson, ce café développe un caractère unique, doux pour l'estomac.", en: "Exposed to monsoon winds, this coffee develops a unique character, gentle on the stomach." },
      price: 6000, size: "250 g", stock: 0, badges: [], tags: "epices intense lait",
      image: "images/produits/inde.webp", reviews: []
    },
    {
      id: "maison", name: "Assemblage Maison", country: "Côte d'Ivoire & Brésil", country_en: "Côte d'Ivoire & Brazil", continent: "afrique",
      region: "Assemblage signature", altitude: "—", variety: "Robusta & Arabica", process: { fr: "Nature", en: "Natural" },
      roast: "medium-dark", intensity: 4, acidity: 2, body: 5, methods: ["espresso", "moka", "cafetiere"],
      notes: { fr: "Cacao, fruits secs, crème épaisse", en: "Cocoa, dried fruit, thick crema" },
      story: { fr: "Notre signature : la force du robusta ivoirien, la rondeur de l'arabica brésilien. Il met tout le monde d'accord.", en: "Our signature: the strength of Ivorian robusta and the roundness of Brazilian arabica. It wins everyone over." },
      price: 18000, size: "1 kg", stock: 25, badges: ["best"], tags: "intense lait chocolat",
      image: "images/produits/maison.webp", reviews: []
    }
  ],

  grinds: ["En grains", "Espresso", "Filtre", "Piston", "Moka"],

  // ---------- Nos adresses (carte) — EXEMPLES à remplacer par vos vraies adresses ----------
  // type : siege | boutique | relais
  locations: [
    { type: "siege", name: "Siège & torréfacteur", address: "Rue des Jardins, Cocody Deux-Plateaux", lat: 5.3698, lng: -3.9935, hours: "Lun–Sam · 7h–19h" },
    { type: "boutique", name: "Boutique Plateau", address: "Avenue Chardy, Le Plateau", lat: 5.3235, lng: -4.0186, hours: "Lun–Sam · 8h–19h" },
    { type: "boutique", name: "Boutique Zone 4", address: "Rue du Dr Blanchard, Marcory Zone 4", lat: 5.2930, lng: -3.9850, hours: "Tous les jours · 8h–20h" },
    { type: "relais", name: "Point relais Angré", address: "Angré 8e tranche, Cocody", lat: 5.3920, lng: -3.9870, hours: "Lun–Sam · 9h–18h" },
    { type: "relais", name: "Point relais Yopougon", address: "Yopougon Siporex", lat: 5.3456, lng: -4.0800, hours: "Lun–Sam · 9h–18h" },
    { type: "relais", name: "Point relais Grand-Bassam", address: "Quartier France, Grand-Bassam", lat: 5.2110, lng: -3.7380, hours: "Mar–Dim · 9h–17h" }
  ],

  // Horaires du service client (heure d'Abidjan) : jour (0 = dimanche) → [ouverture, fermeture]
  support: { 0: [9, 14], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 20], 5: [7, 20], 6: [8, 19] },
  hours: [
    { fr: "Lundi – Vendredi", en: "Monday – Friday", h: "7h00 – 20h00" },
    { fr: "Samedi", en: "Saturday", h: "8h00 – 19h00" },
    { fr: "Dimanche", en: "Sunday", h: "9h00 – 14h00" }
  ],

  // ---------- Livraison — EXEMPLE ----------
  delivery: {
    freeFrom: 20000,
    expressFee: 2500, // supplément livraison express (en moins de 3 h à Abidjan)
    zones: [
      { name: "Cocody", fee: 1000 }, { name: "Plateau", fee: 1500 }, { name: "Adjamé", fee: 1500 },
      { name: "Marcory", fee: 1500 }, { name: "Treichville", fee: 1500 }, { name: "Koumassi", fee: 1500 },
      { name: "Attécoubé", fee: 1500 }, { name: "Yopougon", fee: 2000 }, { name: "Abobo", fee: 2000 },
      { name: "Port-Bouët", fee: 2000 }, { name: "Bingerville", fee: 2500 }, { name: "Songon", fee: 3000 },
      { name: "Anyama", fee: 3000 }, { name: "Grand-Bassam", fee: 3500 }
    ],
    interior: [
      { name: "Yamoussoukro", fee: 3500, delay: "48 h" }, { name: "Bouaké", fee: 4000, delay: "48 h" },
      { name: "San-Pédro", fee: 4500, delay: "48 à 72 h" }, { name: "Daloa", fee: 4000, delay: "48 à 72 h" },
      { name: "Korhogo", fee: 5000, delay: "72 h" }, { name: "Man", fee: 5000, delay: "72 h" }
    ]
  },

  // ---------- Moyens de paiement ----------
  // "logo" : fichier dans images/paiement/. Sans logo, un badge texte sobre est affiché :
  // déposez les logos officiels (PNG/SVG) fournis par chaque banque ou opérateur pour les remplacer.
  payments: [
    { id: "orange", name: "Orange Money", logo: "images/paiement/orange-money.jpg", kind: "mobile" },
    { id: "mtn", name: "MTN Mobile Money", logo: "images/paiement/mtn-momo.jpg", kind: "mobile" },
    { id: "wave", name: "Wave", kind: "mobile", color: "#0b7fae" },
    { id: "moov", name: "Moov Money", logo: "images/paiement/moov-money.jpg", kind: "mobile" },
    { id: "djamo", name: "Djamo", logo: "images/paiement/djamo.jpg", kind: "carte" },
    { id: "visa", name: "Visa", logo: "images/paiement/visa.jpg", kind: "carte" },
    { id: "mastercard", name: "Mastercard", kind: "carte", color: "#eb001b" },
    { id: "uba", name: "UBA", kind: "banque", color: "#d71e28" },
    { id: "ecobank", name: "Ecobank", kind: "banque", color: "#004d71" },
    { id: "nsia", name: "NSIA Banque", kind: "banque", color: "#0a3d7a" },
    { id: "sgci", name: "Société Générale CI", kind: "banque", color: "#e60028" },
    { id: "atlantique", name: "Banque Atlantique", kind: "banque", color: "#00529b" },
    { id: "especes", name: "Espèces à la livraison", kind: "especes", color: "#2e7d4f" }
  ],

  // ---------- Roue de bienvenue — EXEMPLE (codes à honorer lors de la confirmation) ----------
  wheel: {
    enabled: true,
    delay: 25000, // apparaît après 25 s de visite, une seule fois
    prizes: [
      { label: { fr: "−5 %", en: "−5%" }, code: "AKWABA5", type: "percent", value: 5, weight: 34 },
      { label: { fr: "Livraison offerte", en: "Free delivery" }, code: "LIVRAISON", type: "shipping", weight: 30 },
      { label: { fr: "−10 %", en: "−10%" }, code: "AKWABA10", type: "percent", value: 10, weight: 8 },
      { label: { fr: "Échantillon offert", en: "Free sample" }, code: "ECHANTILLON", type: "gift", weight: 28 }
    ]
  },

  // ---------- Fidélité : 1 point par tranche de 1 000 F commandés ----------
  loyalty: {
    tiers: [
      { id: "bronze", min: 0, fr: "Grain de bronze", en: "Bronze bean" },
      { id: "argent", min: 100, fr: "Grain d'argent", en: "Silver bean" },
      { id: "or", min: 300, fr: "Grain d'or", en: "Gold bean" }
    ]
  },

  notifications: [
    { id: "n-vietnam", fr: ["Nouveauté : Vietnam Đà Lạt", "Intense et généreux, parfait pour vos cafés glacés."], en: ["New: Vietnam Đà Lạt", "Intense and generous, perfect for iced coffee."] },
    { id: "n-offre", fr: ["Kenya AA à −15 %", "L'offre du moment, jusqu'à épuisement du stock."], en: ["Kenya AA −15%", "Our current offer, while stocks last."] },
    { id: "n-livraison", fr: ["Livraison express", "Recevez votre café en moins de 3 h à Abidjan."], en: ["Express delivery", "Get your coffee in under 3 hours in Abidjan."] }
  ],

  // Témoignages généraux : uniquement de VRAIS avis clients (prénom + texte + note sur 5).
  // Exemple : { name: "Awa K.", city: "Cocody", rating: 5, text: "…" }
  testimonials: []
};
