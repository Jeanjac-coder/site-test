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

  // Devise et format des prix (XOF = franc CFA)
  currency: "XOF",
  locale: "fr-CI",

  // Livraison — EXEMPLE
  delivery: {
    fee: 1500,              // frais de livraison
    freeFrom: 20000,        // livraison offerte à partir de ce montant (null pour désactiver)
    delay: "Livraison sous 24 h dans tout Abidjan, du lundi au samedi. Pour l'intérieur du pays, écrivez-nous sur WhatsApp. Retrait en boutique possible le jour même pour toute commande passée avant 14 h."
  },

  // Boutique physique — EXEMPLE
  shop: {
    address: "Rue des Jardins, Cocody Deux-Plateaux, Abidjan",
    phoneDisplay: "+225 05 01 49 24 04",
    hours: [
      ["Lundi – Vendredi", "7h00 – 19h00"],
      ["Samedi", "8h00 – 19h00"],
      ["Dimanche", "9h00 – 14h00"]
    ]
  },

  // Moutures proposées pour chaque café
  grinds: ["En grains", "Espresso", "Filtre", "Piston", "Moka"],

  // Vos cafés — EXEMPLES. "id" doit être unique. "price" = prix pour le format indiqué dans "size".
  products: [
    {
      id: "robusta-ci",
      name: "Robusta de Côte d'Ivoire",
      notes: "Cacao · Épices · Corsé et généreux",
      intensity: 5,
      size: "250 g",
      price: 3500,
      color: "#A47E5B",
      badge: "Origine locale"
    },
    {
      id: "ethiopie",
      name: "Éthiopie Yirgacheffe",
      notes: "Agrumes · Jasmin · Thé noir",
      intensity: 2,
      size: "250 g",
      price: 7500,
      color: "#E9D8C4",
      badge: "Coup de cœur"
    },
    {
      id: "bresil",
      name: "Brésil Cerrado",
      notes: "Chocolat · Amande · Rond en bouche",
      intensity: 3,
      size: "250 g",
      price: 6000,
      color: "#D9C2A7"
    },
    {
      id: "maison",
      name: "Assemblage Maison",
      notes: "Robusta ivoirien & arabica · Idéal espresso",
      intensity: 4,
      size: "1 kg",
      price: 18000,
      color: "#C4A484",
      badge: "Format éco"
    }
  ],

  // Avis clients : laissez vide tant que vous n'avez pas de VRAIS avis.
  // Exemple : { name: "Awa", text: "Le meilleur café d'Abidjan !" }
  reviews: []
};
