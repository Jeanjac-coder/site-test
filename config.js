/*
 * ============================================================
 *  CONFIGURATION DU SITE — c'est le seul fichier à modifier
 *  pour personnaliser le contenu (nom, numéro, cafés, prix…).
 * ============================================================
 */
window.SITE_CONFIG = {
  // Nom de votre business (affiché dans l'en-tête, le pied de page et les messages WhatsApp)
  brand: "Aube Café",

  // Numéro WhatsApp au format international, SANS "+", SANS espaces, SANS le 0 initial.
  // Exemple France : 06 12 34 56 78  ->  "33612345678"
  whatsapp: "33600000000",

  // Devise et format des prix
  currency: "EUR",
  locale: "fr-FR",

  // Livraison
  delivery: {
    fee: 4.9,               // frais de livraison
    freeFrom: 40,           // livraison offerte à partir de ce montant (null pour désactiver)
    delay: "Livraison sous 24 à 48 h ouvrées dans la ville et ses environs. Retrait en boutique possible dès le lendemain de la commande."
  },

  // Boutique physique
  shop: {
    address: "12 rue de l'Exemple, 75000 Paris",
    phoneDisplay: "06 00 00 00 00",
    hours: [
      ["Lundi – Vendredi", "7h30 – 18h30"],
      ["Samedi", "9h00 – 18h00"],
      ["Dimanche", "Fermé"]
    ]
  },

  // Moutures proposées pour chaque café
  grinds: ["En grains", "Espresso", "Filtre", "Piston", "Moka"],

  // Vos cafés. "id" doit être unique. "price" = prix pour le format indiqué dans "size".
  products: [
    {
      id: "ethiopie",
      name: "Éthiopie Yirgacheffe",
      notes: "Agrumes · Jasmin · Thé noir",
      intensity: 2,
      size: "250 g",
      price: 11.5,
      color: "#E9D8C4",
      badge: "Coup de cœur"
    },
    {
      id: "colombie",
      name: "Colombie Huila",
      notes: "Caramel · Pomme rouge · Noisette",
      intensity: 3,
      size: "250 g",
      price: 9.9,
      color: "#D9C2A7"
    },
    {
      id: "bresil",
      name: "Brésil Cerrado",
      notes: "Chocolat · Amande · Rond en bouche",
      intensity: 4,
      size: "250 g",
      price: 8.9,
      color: "#C4A484"
    },
    {
      id: "maison",
      name: "Assemblage Maison",
      notes: "Cacao · Fruits secs · Idéal espresso",
      intensity: 5,
      size: "1 kg",
      price: 29.0,
      color: "#A47E5B",
      badge: "Format éco"
    }
  ],

  // Avis clients : laissez vide tant que vous n'avez pas de VRAIS avis.
  // Exemple : { name: "Sophie", text: "Le meilleur café du quartier !" }
  reviews: []
};
