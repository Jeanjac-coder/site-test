/*
 * Textes du site : traductions anglaises, textes dynamiques, articles du blog et FAQ.
 * Le français est écrit directement dans index.html ; l'anglais est ici (clé data-i18n).
 */
window.I18N = {
  // ---------- Textes de la page (version anglaise) ----------
  en: {
    "skip": "Skip to content",
    "nav.home": "Home", "nav.coffees": "Our coffees", "nav.origins": "Origins", "nav.stores": "Our stores",
    "nav.blog": "Journal", "nav.about": "About", "nav.contact": "Contact",
    "search.short": "Search…", "search.label": "Search", "search.long": "A coffee, an origin, a flavour…",
    "search.hero": "Ethiopia, chocolate, mellow, espresso…", "search.go": "Search", "hero.popular": "Popular:",
    "sound.label": "Ambient sound", "wish.title": "Favourites", "notif.title": "Notifications", "notif.read": "Mark all as read",
    "account.title": "My space", "cart.title": "Your bag",
    "stats.coffees": "exceptional coffees", "stats.countries": "countries of origin", "stats.delivery": "to deliver in Abidjan", "stats.support": "customer care, always listening",
    "shop.eyebrow": "The collection", "shop.title": "Fifteen coffees. <em>One standard: excellence.</em>",
    "shop.lead": "Every bean is selected at the source and roasted in Abidjan in small batches. Pick yours, we take care of the rest.",
    "shop.filters": "Filters", "shop.sort": "Sort", "shop.reset": "Reset", "shop.empty": "No coffee matches these filters.",
    "sort.smart": "Relevance", "sort.best": "Best sellers", "sort.new": "New in", "sort.priceAsc": "Price, low to high", "sort.priceDesc": "Price, high to low", "sort.intense": "Most intense", "sort.soft": "Mildest",
    "reco.eyebrow": "For you", "reco.title": "Recommended for your taste", "recent.eyebrow": "History", "recent.title": "Recently viewed",
    "origins.eyebrow": "Our origins", "origins.title": "A world tour, <em>one cup at a time.</em>",
    "origins.lead": "From East Africa to the mountains of Jamaica, every terroir signs its cup. Hover over an origin to discover it.",
    "assist.eyebrow": "Coffee assistant", "assist.title": "Not sure? <em>We'll find the right one.</em>",
    "assist.lead": "Answer three questions and our assistant recommends the coffee that suits you, with the right grind. Simple, quick, no fuss.",
    "assist.cta": "Start with the assistant", "assist.b1": "Akwaba! How do you like your coffee?", "assist.b2": "Rather mild, with milk.", "assist.b3": "Then Colombia Huila will delight you. Caramel notes, very round.",
    "about.eyebrow": "About", "about.title": "Born in Abidjan, <em>for lovers of great coffee.</em>",
    "about.p1": "Aube Café is a simple idea: bringing the world's finest coffees to Côte d'Ivoire, roasted here, with the same care we put into Sunday morning coffee.",
    "about.p2": "We select every lot, roast it in small batches and deliver it fresh. No stock gathering dust, no compromise. Just true taste.",
    "about.v1": "Selected at the source", "about.v1t": "Demanding growers, traceable lots.", "about.v2": "Roasted every week", "about.v2t": "For aromas at their peak.", "about.v3": "Delivered within 24 hours", "about.v3t": "Across Abidjan and the whole country.",
    "reviews.eyebrow": "Customer reviews", "reviews.title": "What you say <em>truly matters.</em>",
    "quote.eyebrow": "Businesses & individuals", "quote.title": "A tailored quote, <em>in under 24 hours.</em>",
    "quote.lead": "Offices, hotels, restaurants, maquis, weddings, seminars or large family orders: tell us everything and we'll prepare a thoughtful offer.",
    "quote.c1": "Volume-based pricing", "quote.c2": "Scheduled delivery and business invoicing", "quote.c3": "Machine support and barista training", "quote.submit": "Get my quote",
    "f.lastname": "Last name *", "f.firstname": "First name *", "f.phone": "Phone *", "f.email": "Email", "f.company": "Company", "f.city": "City *",
    "f.qty": "Desired quantity *", "f.choose": "Choose…", "f.type": "Coffee type", "f.budget": "Estimated budget", "f.message": "Message",
    "f.quotePh": "Delivery frequency, event date, machine needs…", "f.name": "Full name *", "f.subject": "Subject",
    "f.s1": "Question about a coffee", "f.s2": "Order tracking", "f.s3": "Return or exchange", "f.s4": "Partnership", "f.s5": "Other",
    "f.consent": "I agree that my information is used to answer my request (see the privacy policy). *",
    "f.commune": "District or city *", "f.address": "Address or landmark *", "f.addressPh": "Angré 8th section, near the pharmacy…",
    "f.store": "Pickup store", "f.payment": "Preferred payment", "f.promo": "Promo code", "f.apply": "Apply",
    "sent.quoteT": "Request ready!", "sent.quote": "Your request opened in WhatsApp: tap “Send” and we'll get back to you within 24 h.",
    "sent.contactT": "Thank you, noted!", "sent.contact": "Your message opened in WhatsApp: tap “Send” to deliver it to us.",
    "stores.eyebrow": "Our stores", "stores.title": "Come and see us, <em>we're waiting for you.</em>",
    "blog.eyebrow": "The journal", "blog.title": "Coffee, <em>we talk about it with passion.</em>",
    "help.eyebrow": "Customer care", "help.title": "A question? <em>We're here for you.</em>",
    "help.wa": "WhatsApp support", "help.waT": "The fastest answer.", "help.phone": "Phone", "help.mail": "Email",
    "help.chat": "Live chat", "help.chatT": "Virtual assistant, then an advisor.", "help.hours": "Opening hours", "help.search": "Search the help centre…",
    "contact.eyebrow": "Contact", "contact.title": "Write to us, <em>we reply fast.</em>",
    "contact.lead": "A question about a coffee, a special order, a partnership? We read every message carefully.", "contact.submit": "Send message",
    "trust.1": "Pay on confirmation", "trust.2": "Orders tracked end to end", "trust.3": "Easy returns and exchanges", "trust.4": "Freshness guaranteed",
    "pay.title": "Accepted payment methods",
    "footer.tag": "Good coffee, no fuss. Roasted in Abidjan, served with elegance.",
    "nl.title": "The Aube Café letter", "nl.text": "New arrivals, private offers and roaster's tips. Once a month, no more.", "nl.ph": "Your email", "nl.btn": "Subscribe", "nl.ok": "Thank you! Confirm sending in your email app.",
    "footer.shop": "Shop", "footer.all": "All coffees", "footer.pro": "Business quotes", "footer.finder": "Find my coffee",
    "footer.house": "The house", "footer.help": "Help", "footer.faq": "FAQ", "footer.delivery": "Delivery & returns",
    "footer.legal": "Legal", "footer.privacy": "Privacy", "footer.terms": "Terms of use", "footer.notice": "Legal notice", "footer.rights": "All rights reserved.",
    "menu.cats": "Categories", "menu.theme": "Theme", "menu.sound": "Sound",
    "cart.empty": "Your bag is waiting for its first coffee.", "cart.browse": "Explore the collection",
    "cart.delivery": "Delivery", "cart.express": "Express < 3 h", "cart.pickup": "Pickup",
    "cart.order": "Order on WhatsApp", "cart.note": "Pay on confirmation, by Mobile Money, card or cash. No payment on this site.",
    "wish.empty": "Tap the heart on a coffee to keep it here.", "compare.open": "Compare", "chat.title": "Aube Café assistant",
    // Pages
    "sel.eyebrow": "The selection", "sel.title": "Our coffees <em>of the moment.</em>", "sel.all": "See all 15 coffees",
    "explore.eyebrow": "Our origins", "explore.title": "Three continents, <em>a thousand nuances.</em>", "explore.lead": "Every terroir gives its coffee a unique personality. Pick a family to discover its coffees.", "explore.all": "All our origins",
    "about.more": "Our story", "blog.all": "The whole journal",
    "method.eyebrow": "Our method", "method.title": "From cherry <em>to your cup.</em>",
    "method.s1": "Selected at the source", "method.s1t": "We taste every lot before buying it and work with demanding growers on traceable plots.",
    "method.s2": "Roasted in Abidjan", "method.s2t": "Every week, in small batches, with a roast profile designed to reveal each origin.",
    "method.s3": "Ground to order", "method.s3t": "Whole bean or ground for your machine: espresso, filter, French press, moka. As close to delivery as possible.",
    "method.s4": "Delivered fresh", "method.s4t": "Within 24 hours in Abidjan, 48–72 hours elsewhere in the country. All that's left is to enjoy it.",
    "cta.eyebrow": "Businesses, hotels, events", "cta.title": "Great coffee for the whole team? <em>Let's talk.</em>", "cta.text": "A tailored quote in under 24 hours, volume pricing and scheduled delivery.", "cta.quote": "Request a quote", "cta.finder": "Find my coffee",
    "infos.eyebrow": "Practical info", "infos.title": "In store or at home, <em>whatever suits you.</em>",
    "infos.d": "Home delivery", "infos.dt": "24 hours in Abidjan, under 3 hours with express, 48–72 hours elsewhere in the country. Free from 20,000 CFA.", "infos.dl": "Areas and rates →",
    "infos.p": "Free pickup", "infos.pt": "Order online, then collect your coffee in store or at a pickup point, free of charge.", "infos.pl": "Order now →",
    "ph.cafes.eyebrow": "The collection", "ph.cafes.title": "Fifteen coffees. <em>One standard: excellence.</em>", "ph.cafes.lead": "Every bean is selected at the source and roasted in Abidjan in small batches. Pick yours, we take care of the rest.",
    "ph.origins.eyebrow": "Our origins", "ph.origins.title": "A world tour, <em>one cup at a time.</em>", "ph.origins.lead": "From East Africa to the mountains of Jamaica, every terroir signs its cup. Altitude, variety, process: here is where our coffees come from.",
    "ph.stores.eyebrow": "Our stores", "ph.stores.title": "Come and see us, <em>we're waiting for you.</em>", "ph.stores.lead": "Come smell, taste and leave with freshly ground coffee. Or collect your order for free close to home.",
    "ph.blog.eyebrow": "The journal", "ph.blog.title": "Coffee, <em>we talk about it with passion.</em>", "ph.blog.lead": "Brewing tips, origin stories and roaster's secrets, without jargon.",
    "ph.about.eyebrow": "Our story", "ph.about.title": "Real coffee, <em>roasted here, with care.</em>", "ph.about.lead": "An Ivorian house born from one belief: good coffee doesn't wait. It is chosen at the source, roasted patiently and enjoyed fresh.",
    "ph.contact.eyebrow": "Contact & help", "ph.contact.title": "A question, a quote? <em>We reply fast.</em>", "ph.contact.lead": "WhatsApp, phone, email or online assistant: choose what suits you. We answer every message with care."
  },

  // ---------- Textes générés par le script : [français, anglais] ----------
  dyn: {
    add: ["Ajouter", "Add"], added: ["Ajouté", "Added"], addCart: ["Ajouter au panier", "Add to bag"], soldOut: ["Épuisé", "Sold out"],
    inStock: ["En stock", "In stock"], low: ["Plus que {n} en stock", "Only {n} left"], notify: ["Prévenez-moi", "Notify me"],
    new: ["Nouveauté", "New"], best: ["Meilleure vente", "Best seller"], promo: ["Promo", "Sale"],
    intensity: ["Intensité", "Intensity"], acidity: ["Acidité", "Acidity"], body: ["Corps", "Body"],
    origin: ["Origine", "Origin"], region: ["Région", "Region"], altitude: ["Altitude", "Altitude"], variety: ["Variété", "Variety"], process: ["Procédé", "Process"],
    roasting: ["Torréfaction", "Roasting"], notes: ["Notes aromatiques", "Tasting notes"], prep: ["Conseils de préparation", "Brewing tips"],
    similar: ["Vous aimerez aussi", "You may also like"], reviews: ["Avis clients", "Customer reviews"], noReviews: ["Pas encore d'avis sur ce café. Goûtez-le, et soyez le premier à partager votre expérience.", "No reviews yet for this coffee. Taste it and be the first to share your experience."],
    leaveReview: ["Laisser un avis", "Leave a review"], grind: ["Mouture", "Grind"], qty: ["Quantité", "Quantity"],
    wishAdd: ["Ajouter aux favoris", "Add to favourites"], wishRemove: ["Retirer des favoris", "Remove from favourites"], compare: ["Comparer", "Compare"],
    results: ["{n} café", "{n} coffee"], resultsN: ["{n} cafés", "{n} coffees"], show: ["Voir {n} résultat(s)", "Show {n} result(s)"],
    f_continent: ["Origine", "Origin"], f_roast: ["Torréfaction", "Roast"], f_intensity: ["Intensité", "Intensity"], f_method: ["Méthode", "Method"],
    f_notes: ["Arômes", "Flavours"], f_price: ["Prix maximum", "Max price"], f_more: ["Plus", "More"], f_stock: ["En stock uniquement", "In stock only"], f_promo: ["En promotion", "On sale"],
    afrique: ["Afrique", "Africa"], ameriques: ["Amériques", "Americas"], asie: ["Asie", "Asia"],
    light: ["Claire", "Light"], medium: ["Moyenne", "Medium"], "medium-dark": ["Moyenne-foncée", "Medium-dark"], dark: ["Foncée", "Dark"],
    espresso: ["Espresso", "Espresso"], filtre: ["Filtre", "Filter"], piston: ["Piston", "French press"], moka: ["Moka", "Moka pot"], cafetiere: ["Cafetière", "Drip machine"],
    doux: ["Doux", "Mild"], equilibre: ["Équilibré", "Balanced"], intense: ["Intense", "Intense"],
    chocolat: ["Chocolat", "Chocolate"], caramel: ["Caramel", "Caramel"], fruite: ["Fruité", "Fruity"], floral: ["Floral", "Floral"], epices: ["Épicé", "Spicy"],
    recent: ["Recherches récentes", "Recent searches"], suggestions: ["Suggestions", "Suggestions"], products: ["Cafés", "Coffees"], clear: ["Effacer", "Clear"],
    noResult: ["Aucun résultat pour « {q} ». Essayez « Kenya », « chocolat » ou « doux ».", "No results for “{q}”. Try “Kenya”, “chocolate” or “mild”."],
    subtotal: ["Sous-total", "Subtotal"], discount: ["Remise", "Discount"], shipping: ["Livraison", "Delivery"], total: ["Total", "Total"],
    free: ["Offerte", "Free"], toConfirm: ["À confirmer", "To be confirmed"], chooseCity: ["Selon la commune", "Depends on district"],
    freeLeft: ["Plus que {n} pour la livraison offerte", "{n} away from free delivery"], freeOk: ["Livraison offerte débloquée 🎉", "Free delivery unlocked 🎉"],
    chooseCommune: ["Choisir…", "Choose…"], abidjan: ["Abidjan", "Abidjan"], interior: ["Intérieur du pays", "Rest of the country"],
    codeOk: ["Code appliqué : {c}", "Code applied: {c}"], codeBad: ["Ce code n'est pas valide.", "This code is not valid."],
    errName: ["Indiquez votre nom, s'il vous plaît.", "Please enter your name."], errPhone: ["Indiquez un numéro de téléphone valide.", "Please enter a valid phone number."],
    errCommune: ["Choisissez votre commune ou ville.", "Choose your district or city."], errAddress: ["Indiquez une adresse ou un repère.", "Please enter an address or landmark."],
    errRequired: ["Merci de remplir les champs obligatoires.", "Please fill in the required fields."], errEmail: ["Cette adresse e-mail semble incorrecte.", "This email looks incorrect."],
    errConsent: ["Merci d'accepter l'utilisation de vos informations.", "Please accept the use of your information."],
    addedToast: ["{p} ajouté au panier", "{p} added to your bag"], wishToast: ["Ajouté à vos favoris", "Added to your favourites"], orderToast: ["Votre commande est prête dans WhatsApp. Merci !", "Your order is ready in WhatsApp. Thank you!"],
    compareMax: ["Vous pouvez comparer jusqu'à 3 cafés.", "You can compare up to 3 coffees."], compareTitle: ["Comparer les cafés", "Compare coffees"],
    price: ["Prix", "Price"], size: ["Format", "Size"], methodsL: ["Méthodes conseillées", "Recommended methods"],
    open: ["Disponible maintenant", "Available now"], closed: ["Fermé · réouverture {d} à {h} h", "Closed · reopens {d} at {h}:00"],
    today: ["aujourd'hui", "today"], tomorrow: ["demain", "tomorrow"],
    days: [["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]],
    all: ["Tous", "All"], siege: ["Siège", "Head office"], boutique: ["Boutiques", "Stores"], relais: ["Points relais", "Pickup points"],
    t_siege: ["Siège", "Head office"], t_boutique: ["Boutique", "Store"], t_relais: ["Point relais", "Pickup point"],
    route: ["Itinéraire", "Directions"], seeMap: ["Voir sur la carte", "Show on map"], readMore: ["Lire l'article", "Read article"], minRead: ["{n} min de lecture", "{n} min read"],
    viewCoffees: ["Voir les cafés", "See coffees"], coffeesFrom: ["{n} café(s)", "{n} coffee(s)"],
    reviewsEmptyT: ["Les premiers avis arrivent.", "The first reviews are on their way."],
    reviewsEmpty: ["Nous publions uniquement les avis de vrais clients. Vous avez goûté nos cafés ? Votre retour nous aide à progresser et guide les prochains amateurs.", "We only publish reviews from real customers. Tasted our coffees? Your feedback helps us improve and guides other coffee lovers."],
    yourName: ["Votre prénom", "Your first name"], yourReview: ["Votre avis", "Your review"], sendReview: ["Envoyer mon avis", "Send my review"],
    reviewSent: ["Merci ! Votre avis s'est ouvert dans WhatsApp. Nous le publions après vérification.", "Thank you! Your review opened in WhatsApp. We publish it after verification."],
    notifEmpty: ["Aucune notification.", "No notifications."],
    // Espace client
    accIntro: ["Votre espace est enregistré sur cet appareil : commandes envoyées, points de fidélité et recommandations.", "Your space is saved on this device: orders sent, loyalty points and recommendations."],
    orders: ["Mes commandes", "My orders"], noOrders: ["Aucune commande pour le moment.", "No orders yet."], points: ["points", "points"],
    loyalty: ["Programme de fidélité", "Loyalty programme"], nextTier: ["Encore {n} points pour « {t} »", "{n} more points to “{t}”"], topTier: ["Vous avez atteint le niveau le plus élevé. Merci !", "You've reached the top tier. Thank you!"],
    loyaltyNote: ["1 point par tranche de 1 000 F commandés. Points indicatifs, validés par notre équipe à la confirmation.", "1 point per 1,000 CFA ordered. Indicative points, validated by our team on confirmation."],
    badges: ["Badges", "Badges"], b_first: ["Première tasse", "First cup"], b_explorer: ["Explorateur (3 origines)", "Explorer (3 origins)"], b_fan: ["Fidèle (5 commandes)", "Loyal (5 orders)"], b_curious: ["Curieux (10 cafés vus)", "Curious (10 coffees viewed)"],
    myCode: ["Mon code de bienvenue", "My welcome code"], forYou: ["Pour vous", "For you"], status: ["Envoyée sur WhatsApp", "Sent on WhatsApp"], reorder: ["Recommander", "Order again"],
    // Roue
    wheelT: ["Akwaba ! Tentez votre chance", "Akwaba! Try your luck"], wheelP: ["Un cadeau de bienvenue vous attend. Un seul essai, bonne chance !", "A welcome gift awaits. One spin only, good luck!"],
    spin: ["Lancer la roue", "Spin the wheel"], won: ["Bravo ! Vous gagnez : {p}", "Congrats! You won: {p}"], wonCode: ["Votre code : {c} (appliqué au panier)", "Your code: {c} (applied to your bag)"], later: ["Plus tard", "Later"], shop: ["Je fais mes courses", "Start shopping"],
    // Assistant
    botHello: ["Akwaba ! Je suis l'assistant Aube Café. Je vous aide à trouver le café idéal en trois questions. On y va ?", "Akwaba! I'm the Aube Café assistant. I'll help you find your ideal coffee in three questions. Shall we?"],
    botGo: ["C'est parti", "Let's go"], botHuman: ["Parler à un conseiller", "Talk to an advisor"], botTrack: ["Suivre ma commande", "Track my order"],
    botQ1: ["Comment buvez-vous votre café ?", "How do you drink your coffee?"], botQ2: ["Quels arômes vous font envie ?", "Which flavours tempt you?"], botQ3: ["Et le réveil idéal, c'est…", "And the ideal wake-up is…"],
    botResult: ["Je vous recommande le {p} : {n}. Mouture conseillée : {g}.", "I recommend {p}: {n}. Suggested grind: {g}."],
    botAlso: ["À essayer aussi : {a}.", "Also worth trying: {a}."], botSee: ["Voir la fiche", "View details"], botAgain: ["Recommencer", "Start over"],
    botHumanMsg: ["Un conseiller vous répond sur WhatsApp, aux heures d'ouverture.", "An advisor answers on WhatsApp during opening hours."],
    botTrackMsg: ["Envoyez-nous votre nom sur WhatsApp, nous vous donnons l'état de votre commande.", "Send us your name on WhatsApp and we'll give you your order status."],
    openWa: ["Ouvrir WhatsApp", "Open WhatsApp"],
    q1a: ["Espresso bien serré", "Strong espresso"], q1b: ["Avec du lait", "With milk"], q1c: ["Filtre, tranquille", "Filter, slow"], q1d: ["Je découvre", "I'm discovering"],
    q2a: ["Chocolat & noisette", "Chocolate & hazelnut"], q2b: ["Fruits & fleurs", "Fruit & flowers"], q2c: ["Épices & caractère", "Spice & character"], q2d: ["Caramel & douceur", "Caramel & sweetness"],
    q3a: ["Un vrai coup de fouet", "A real kick"], q3b: ["Tout en douceur", "Nice and gentle"], q3c: ["Une expérience rare", "A rare experience"],
    soundOn: ["Ambiance sonore activée", "Ambient sound on"], soundOff: ["Ambiance sonore coupée", "Ambient sound off"],
    socialSoon: ["Bientôt disponible", "Coming soon"], nlBad: ["Indiquez un e-mail valide.", "Enter a valid email."]
  },

  // ---------- Conseils de préparation par méthode ----------
  prep: {
    espresso: ["18 g de café moulu fin pour 36 g de boisson, en 25 à 30 secondes, eau à 93 °C.", "18 g of fine grounds for 36 g of coffee, in 25–30 seconds, water at 93 °C."],
    filtre: ["15 g pour 250 ml d'eau à 92–94 °C. Faites gonfler 30 s, puis versez en cercles lents.", "15 g for 250 ml of water at 92–94 °C. Bloom for 30 s, then pour in slow circles."],
    piston: ["Mouture grossière, 30 g pour 500 ml d'eau à 94 °C. Infusez 4 minutes, puis pressez doucement.", "Coarse grind, 30 g for 500 ml at 94 °C. Steep 4 minutes, then press gently."],
    moka: ["Remplissez le filtre sans tasser, eau chaude dans la base, feu doux. Retirez dès le premier glouglou.", "Fill the basket without tamping, hot water in the base, low heat. Remove at the first gurgle."],
    cafetiere: ["Une cuillère à soupe rase par tasse, mouture moyenne. Servez dans les 20 minutes.", "One level tablespoon per cup, medium grind. Serve within 20 minutes."]
  },
  roastText: {
    light: ["Torréfaction claire et lente au tambour, pour préserver l'éclat et les notes florales.", "Light, slow drum roast to preserve brightness and floral notes."],
    medium: ["Torréfaction moyenne au tambour, pour un équilibre parfait entre douceur et arômes.", "Medium drum roast for the perfect balance of sweetness and aroma."],
    "medium-dark": ["Torréfaction moyenne-foncée, qui révèle le cacao et donne du corps.", "Medium-dark roast that brings out cocoa and body."],
    dark: ["Torréfaction foncée et maîtrisée, pour une tasse intense à la crème épaisse.", "Dark, controlled roast for an intense cup with thick crema."]
  },

  // ---------- Centre d'aide ----------
  faq: [
    { cat: ["Commandes", "Orders"], q: ["Comment passer commande ?", "How do I order?"], a: ["Ajoutez vos cafés au panier, renseignez vos coordonnées puis appuyez sur « Commander sur WhatsApp ». Votre commande s'ouvre, rédigée : il suffit de l'envoyer. Nous confirmons la disponibilité et le montant dans l'heure.", "Add coffees to your bag, fill in your details and tap “Order on WhatsApp”. Your order opens, already written: just send it. We confirm availability and the amount within the hour."] },
    { cat: ["Commandes", "Orders"], q: ["Puis-je modifier ou annuler ma commande ?", "Can I change or cancel my order?"], a: ["Oui, gratuitement, tant qu'elle n'a pas été remise au livreur. Écrivez-nous simplement sur WhatsApp.", "Yes, free of charge, as long as it hasn't been handed to the courier. Just message us on WhatsApp."] },
    { cat: ["Commandes", "Orders"], q: ["Comment suivre ma commande ?", "How do I track my order?"], a: ["Nous vous envoyons un message à chaque étape : confirmation, préparation, départ du livreur. Vous pouvez aussi nous écrire à tout moment.", "We message you at each step: confirmation, preparation, courier departure. You can also write to us at any time."] },
    { cat: ["Livraison", "Delivery"], q: ["Quels sont les délais de livraison ?", "What are the delivery times?"], a: ["24 heures ouvrées à Abidjan, moins de 3 heures en express, 48 à 72 heures pour l'intérieur du pays. Tous les détails sont dans notre politique de livraison.", "24 business hours in Abidjan, under 3 hours with express, 48–72 hours elsewhere in the country. Full details in our delivery policy."] },
    { cat: ["Livraison", "Delivery"], q: ["Combien coûte la livraison ?", "How much is delivery?"], a: ["De 1 000 à 3 500 F CFA selon la commune à Abidjan, et offerte dès 20 000 F d'achat. L'express ajoute 2 500 F.", "From 1,000 to 3,500 CFA depending on the district in Abidjan, and free from 20,000 CFA. Express adds 2,500 CFA."] },
    { cat: ["Paiement", "Payment"], q: ["Quels moyens de paiement acceptez-vous ?", "Which payment methods do you accept?"], a: ["Orange Money, MTN Mobile Money, Wave, Moov Money, Djamo, cartes Visa et Mastercard, virement bancaire et espèces à la livraison. Le paiement se fait après confirmation de la commande.", "Orange Money, MTN Mobile Money, Wave, Moov Money, Djamo, Visa and Mastercard, bank transfer and cash on delivery. Payment happens after the order is confirmed."] },
    { cat: ["Paiement", "Payment"], q: ["Le paiement est-il sécurisé ?", "Is payment secure?"], a: ["Aucun paiement n'est saisi sur ce site. Vous payez directement via votre opérateur ou à la livraison. Nous ne vous demanderons jamais votre code secret.", "No payment is entered on this site. You pay directly through your provider or on delivery. We will never ask for your PIN."] },
    { cat: ["Produits", "Products"], q: ["Grains ou moulu : que choisir ?", "Beans or ground?"], a: ["Les grains gardent leurs arômes plus longtemps si vous avez un moulin. Sinon, choisissez la mouture de votre machine : nous moulons au plus près de la livraison.", "Beans keep their aromas longer if you have a grinder. Otherwise, choose your machine's grind: we grind as close to delivery as possible."] },
    { cat: ["Produits", "Products"], q: ["Comment conserver mon café sous notre climat ?", "How should I store coffee in our climate?"], a: ["Dans son sachet bien refermé ou une boîte hermétique, à l'abri de la chaleur, de la lumière et de l'humidité. Évitez le réfrigérateur et consommez-le dans le mois.", "In its sealed bag or an airtight tin, away from heat, light and humidity. Avoid the fridge and enjoy within a month."] },
    { cat: ["Retours", "Returns"], q: ["Puis-je retourner un produit ?", "Can I return a product?"], a: ["Un sachet non ouvert peut être échangé ou remboursé sous 7 jours. En cas de produit abîmé ou d'erreur, signalez-le sous 24 h avec une photo : nous le remplaçons sans frais.", "An unopened bag can be exchanged or refunded within 7 days. If a product is damaged or wrong, report it within 24 h with a photo: we replace it at no cost."] }
  ],

  // ---------- Articles du blog ----------
  posts: [
    {
      id: "robusta-arabica", image: "images/hero/hero-1-sm.webp", min: 4,
      title: ["Robusta ou arabica : lequel vous ressemble ?", "Robusta or arabica: which one is you?"],
      excerpt: ["Deux familles, deux caractères. On vous explique tout, sans jargon.", "Two families, two personalities. We explain everything, without jargon."],
      body: [
        "<p>Le café que vous buvez vient presque toujours de deux grandes espèces : l'<strong>arabica</strong> et le <strong>robusta</strong>. Elles ne se cultivent pas au même endroit, et elles ne se goûtent pas de la même façon.</p><h3>L'arabica, l'aromatique</h3><p>Il pousse en altitude, souvent au-dessus de 1 200 mètres. Plus lent à mûrir, il développe des arômes fins : fruits, fleurs, caramel. Son acidité est plus marquée, son amertume plus discrète. C'est le cas de nos cafés d'Éthiopie, du Kenya ou de Colombie.</p><h3>Le robusta, le caractère</h3><p>Plus résistant, il pousse à basse altitude, comme en Côte d'Ivoire. Il contient près de deux fois plus de caféine, donne une crème épaisse et une tasse corsée, aux notes de cacao. Le robusta ivoirien, c'est notre fierté.</p><h3>Et si on mariait les deux ?</h3><p>C'est tout le principe de notre <strong>Assemblage Maison</strong> : la puissance du robusta, la rondeur de l'arabica. Le café qui met tout le monde d'accord.</p>",
        "<p>The coffee you drink almost always comes from two main species: <strong>arabica</strong> and <strong>robusta</strong>. They don't grow in the same places, and they don't taste the same.</p><h3>Arabica, the aromatic one</h3><p>It grows at altitude, often above 1,200 metres. Slower to ripen, it develops fine aromas: fruit, flowers, caramel. Its acidity is brighter, its bitterness more subtle. Think of our coffees from Ethiopia, Kenya or Colombia.</p><h3>Robusta, the bold one</h3><p>Hardier, it grows at low altitude, as in Côte d'Ivoire. It holds nearly twice the caffeine, gives a thick crema and a strong cup with cocoa notes. Ivorian robusta is our pride.</p><h3>Why not both?</h3><p>That's the idea behind our <strong>House Blend</strong>: the power of robusta, the roundness of arabica. The coffee everyone agrees on.</p>"
      ]
    },
    {
      id: "conserver", image: "images/hero/hero-2-sm.webp", min: 3,
      title: ["Conserver son café sous le soleil d'Abidjan", "Storing coffee under the Abidjan sun"],
      excerpt: ["Chaleur et humidité sont les ennemies du café. Nos conseils pour qu'il reste parfait.", "Heat and humidity are coffee's enemies. Our tips to keep it perfect."],
      body: [
        "<p>Un bon café se mérite… et se protège. Sous notre climat chaud et humide, quelques gestes simples font toute la différence.</p><h3>1. Refermez bien le sachet</h3><p>L'oxygène fait fuir les arômes. Chassez l'air, refermez le zip, ou versez le café dans une boîte hermétique opaque.</p><h3>2. Fuyez la chaleur et la lumière</h3><p>Un placard frais, loin de la gazinière et des fenêtres. Jamais en plein soleil.</p><h3>3. Pas de réfrigérateur</h3><p>Le froid crée de la condensation à chaque ouverture : l'humidité abîme le café et lui donne des goûts étrangers.</p><h3>4. Moulez au dernier moment</h3><p>Le café moulu perd ses arômes en quelques jours. Si vous avez un moulin, prenez nos grains. Sinon, commandez de petites quantités, plus souvent.</p>",
        "<p>Good coffee is earned… and protected. In our hot, humid climate, a few simple habits make all the difference.</p><h3>1. Seal the bag well</h3><p>Oxygen chases away aroma. Squeeze out the air and close the zip, or pour the coffee into an opaque airtight tin.</p><h3>2. Avoid heat and light</h3><p>A cool cupboard, away from the stove and windows. Never in direct sun.</p><h3>3. No fridge</h3><p>Cold creates condensation every time you open it: moisture damages coffee and adds off-flavours.</p><h3>4. Grind at the last moment</h3><p>Ground coffee loses its aroma within days. If you have a grinder, choose our beans. Otherwise, order smaller amounts more often.</p>"
      ]
    },
    {
      id: "espresso-maison", image: "images/hero/hero-3-sm.webp", min: 5,
      title: ["Réussir son espresso à la maison", "Nailing espresso at home"],
      excerpt: ["La bonne mouture, le bon dosage, le bon temps : les trois secrets d'une tasse parfaite.", "The right grind, dose and time: three secrets to a perfect cup."],
      body: [
        "<p>Un espresso réussi, c'est une crème noisette, un corps soyeux et un équilibre entre douceur et amertume. Voici la méthode de nos baristas.</p><h3>Le dosage</h3><p>18 grammes de café pour environ 36 grammes de boisson. Pesez, c'est le secret de la régularité.</p><h3>La mouture</h3><p>Fine, mais pas poudreuse. Si l'espresso coule trop vite, moulez plus fin ; s'il goutte à peine, moulez plus gros.</p><h3>Le temps</h3><p>Entre 25 et 30 secondes d'extraction. Une eau à 93 °C, un tassage régulier, une tasse préchauffée.</p><h3>Quel café choisir ?</h3><p>Pour un espresso intense : Robusta de Côte d'Ivoire ou Assemblage Maison. Pour un espresso plus doux et gourmand : Brésil Cerrado ou Colombie Huila.</p>",
        "<p>A great espresso means hazelnut crema, a silky body and a balance of sweetness and bitterness. Here is our baristas' method.</p><h3>The dose</h3><p>18 grams of coffee for about 36 grams of drink. Weigh it: that's the key to consistency.</p><h3>The grind</h3><p>Fine, but not powdery. If it runs too fast, grind finer; if it barely drips, grind coarser.</p><h3>The time</h3><p>25 to 30 seconds of extraction. Water at 93 °C, an even tamp, a warmed cup.</p><h3>Which coffee?</h3><p>For an intense espresso: Côte d'Ivoire Robusta or House Blend. For a softer, indulgent espresso: Brazil Cerrado or Colombia Huila.</p>"
      ]
    }
  ]
};
