import handoff from "@/assets/optimized/delivery-image-1.webp";
import customer from "@/assets/optimized/delivery-image-2.webp";
import city from "@/assets/optimized/delivery-image-3.webp";
import sunset from "@/assets/optimized/delivery-image-4.webp";
import warehouse from "@/assets/optimized/storeroom.webp";
export { handoff, customer, city, sunset, warehouse };
export const faq = [
  [
    "Comment commencer avec Yolo Business ?",
    "Découvrez l’espace de démonstration, puis préparez votre demande de prise de contact. L’équipe Yolo vous accompagne pour définir vos points de collecte et activer votre accès.",
  ],
  [
    "Dans quelles zones livrez-vous ?",
    "Le lancement est pensé pour Yaoundé. La prise en charge dépend du quartier de départ, de la destination et de la disponibilité des livreurs. Vérifiez la couverture avant de confier un colis.",
  ],
  [
    "Qui prend en charge les frais de livraison ?",
    "Dans le parcours envisagé, l’expéditeur prend en charge les frais. Le montant et le mode de règlement doivent être confirmés avant la prise en charge.",
  ],
  [
    "Comment savoir si mon colis est arrivé ?",
    "Le parcours cible prévoit un code envoyé au destinataire sur WhatsApp. Celui-ci le communique au livreur au moment de recevoir son colis. La disponibilité de ce parcours doit être confirmée lors de votre activation.",
  ],
  [
    "Puis-je essayer la plateforme ?",
    "Oui. L’espace de démonstration permet d’explorer l’interface avec des données fictives, sans déclencher de livraison réelle.",
  ],
];
export const steps = [
  {
    title: "Vous préparez.",
    description:
      "Renseignez votre point de collecte, les coordonnées du destinataire et les détails du colis. Quelques informations, un départ bien organisé.",
    image: warehouse,
    label: "01 / Un colis prêt à partir",
  },
  {
    title: "Nous prenons le relais.",
    description:
      "Votre colis est pris en charge. Retrouvez les étapes de son parcours depuis un espace commun, pour garder une vision claire de vos livraisons.",
    image: city,
    label: "02 / En route vers votre client",
  },
  {
    title: "Votre client reçoit.",
    description:
      "Une remise en main propre, avec confirmation de réception selon le parcours activé pour votre entreprise. La dernière étape compte autant que la première.",
    image: handoff,
    label: "03 / Une livraison qui se termine bien",
  },
];
export const articles = [
  {
    slug: "preparer-un-colis",
    title: "Un colis bien préparé, c’est déjà un bon départ.",
    category: "GUIDE PRATIQUE",
    image: customer,
    paragraphs: [
      "Choisissez un emballage adapté au contenu. Un carton solide, un calage suffisant et une fermeture soignée protègent les articles pendant le transport.",
      "Indiquez le nom et le numéro du destinataire. Ajoutez un quartier précis, un repère facile à identifier et, si possible, un point sur la carte.",
      "Prévenez le destinataire du départ de son colis. Confirmez sa disponibilité et rappelez-lui de vérifier son colis à la réception.",
    ],
  },
  {
    slug: "livrer-a-yaounde",
    title: "À Yaoundé, une adresse précise fait la différence.",
    category: "SUR LE TERRAIN",
    image: sunset,
    paragraphs: [
      "Un nom de quartier ne suffit pas toujours. Ajoutez un lieu connu à proximité, l’accès au bâtiment et un contact joignable.",
      "Précisez les contraintes utiles : portail fermé, accès par une autre rue ou disponibilité limitée du destinataire. Ces détails évitent les appels inutiles.",
      "Avant de lancer une livraison, vérifiez que le départ et la destination sont couverts. Le délai dépend notamment du trajet et de la circulation.",
    ],
  },
  {
    slug: "organiser-ses-expeditions",
    title: "Une routine simple pour vos journées chargées.",
    category: "VIE DE COMMERÇANT",
    image: warehouse,
    paragraphs: [
      "Regroupez les colis prêts à partir dans un espace identifié. Étiquetez chaque commande avant l’arrivée du livreur.",
      "Vérifiez les coordonnées au moment de la commande, puis avant l’expédition. Une minute de préparation peut éviter un second passage.",
      "Gardez une trace des colis confiés et des incidents éventuels. Faites un point régulier sur les destinations et les moments les plus fréquents.",
    ],
  },
];
export const pages: Record<
  string,
  {
    eyebrow: string;
    title: string;
    intro: string;
    sections: [string, string][];
    image?: string;
  }
> = {
  "/solution": {
    eyebrow: "LA SOLUTION YOLO",
    title: "Vos livraisons méritent un espace à elles.",
    intro:
      "Une entrée simple pour organiser les départs, retrouver vos colis et accompagner votre activité au quotidien.",
    image: handoff,
    sections: [
      [
        "Un point de départ commun",
        "Retrouvez vos demandes et les informations essentielles au même endroit. L’espace connecté est accessible aux comptes autorisés par l’équipe Yolo.",
      ],
      [
        "De la visibilité au quotidien",
        "Consultez vos opérations et les étapes disponibles pour votre compte. La démonstration présente aussi des fonctionnalités en cours de développement.",
      ],
      [
        "À votre rythme",
        "Commencez par vos besoins réels : volumes, points de collecte et quartiers desservis. L’activation se prépare avec l’équipe Yolo.",
      ],
    ],
  },
  "/entreprises": {
    eyebrow: "POUR VOTRE ACTIVITÉ",
    title: "Petit commerce. Grandes ambitions.",
    intro:
      "Votre métier est de faire grandir votre activité. Le nôtre : vous aider à organiser le chemin jusqu’à vos clients.",
    image: warehouse,
    sections: [
      [
        "Boutiques & commerces",
        "Faites partir vos commandes depuis votre boutique. Préparez vos colis et les coordonnées de vos clients pour une prise en charge plus fluide.",
      ],
      [
        "E-commerce & réseaux sociaux",
        "Vous vendez en ligne ou sur WhatsApp ? Rassemblez les informations de chaque commande avant de confier votre colis.",
      ],
      [
        "Distribution & équipes",
        "Organisez vos points de collecte et vos destinataires réguliers. Les accès sont à définir selon votre organisation.",
      ],
    ],
  },
  "/tarifs": {
    eyebrow: "UNE OFFRE À VOTRE MESURE",
    title: "Le bon départ, au juste prix.",
    intro:
      "Distance, volume, fréquence : définissons une formule adaptée à vos livraisons. La grille commerciale est en cours de finalisation.",
    sections: [
      [
        "À la course",
        "Pour les besoins ponctuels. Le prix est confirmé avant la prise en charge, selon le trajet et les caractéristiques du colis.",
      ],
      [
        "Au quotidien",
        "Pour les commerces qui expédient régulièrement. Préparez une estimation de vos volumes et destinations pour discuter d’une offre adaptée.",
      ],
      [
        "Sur mesure",
        "Pour plusieurs points de collecte ou une organisation spécifique. Décrivez vos contraintes afin de préparer votre accompagnement.",
      ],
    ],
  },
  "/zones": {
    eyebrow: "PROCHE DE VOUS",
    title: "Une histoire qui commence à Yaoundé.",
    intro:
      "La couverture se construit quartier par quartier, avec des trajets adaptés aux besoins des commerces locaux.",
    image: city,
    sections: [
      [
        "Vérifier un trajet",
        "Communiquez les quartiers de départ et d’arrivée, ainsi que les repères utiles. La prise en charge reste à confirmer avant chaque expédition.",
      ],
      [
        "Les bonnes informations",
        "Une adresse précise, un numéro joignable et la disponibilité du destinataire facilitent le trajet.",
      ],
      [
        "Et demain ?",
        "Les prochaines zones seront annoncées après validation opérationnelle. Aucune ouverture ni date supplémentaire n’est promise à ce stade.",
      ],
    ],
  },
  "/a-propos": {
    eyebrow: "BONJOUR, NOUS C’EST YOLO",
    title: "Derrière chaque colis, un commerce qui avance.",
    intro:
      "Yolo Business est un projet de livraison pensé pour les commerçants et leurs clients au Cameroun.",
    image: customer,
    sections: [
      [
        "Notre idée",
        "Simplifier l’organisation des livraisons locales avec un espace accessible et des informations faciles à retrouver.",
      ],
      [
        "Notre point de départ",
        "Yaoundé, ses commerçants, ses quartiers et les besoins concrets du quotidien. Le service est en phase de préparation et d’évolution.",
      ],
      [
        "Construire ensemble",
        "Les premiers retours des commerces et livreurs nous aident à améliorer le parcours. Découvrez la démonstration et préparez vos remarques.",
      ],
    ],
  },
  "/partenaires": {
    eyebrow: "AVANÇONS ENSEMBLE",
    title: "Et si on faisait un bout de chemin ?",
    intro:
      "Livreurs, commerces et partenaires locaux : préparons une collaboration adaptée à votre activité.",
    image: sunset,
    sections: [
      [
        "Vous êtes livreur",
        "Préparez vos coordonnées, votre zone habituelle et les informations sur votre moyen de transport. Les conditions de collaboration restent à valider avec Yolo.",
      ],
      [
        "Vous êtes commerçant",
        "Indiquez vos points de départ et le volume estimé de vos envois pour préparer un parcours adapté.",
      ],
      [
        "Vous représentez une organisation",
        "Expliquez votre activité et le besoin à couvrir. Aucune inscription automatique n’est réalisée depuis cette page.",
      ],
    ],
  },
  "/mentions-legales": {
    eyebrow: "INFORMATIONS DU SITE",
    title: "Mentions légales.",
    intro:
      "Page provisoire — les informations de l’éditeur doivent être complétées avant une ouverture commerciale.",
    sections: [
      [
        "Éditeur",
        "Yolo Business, projet de plateforme de livraison au Cameroun. Raison sociale, adresse du siège, immatriculation et responsable de publication : à renseigner.",
      ],
      [
        "Contact & hébergement",
        "Les coordonnées officielles et les informations de l’hébergeur seront publiées ici après validation.",
      ],
      [
        "Démonstration",
        "Les écrans de démonstration contiennent des données fictives. Ils ne constituent ni une offre ferme ni une confirmation de disponibilité du service.",
      ],
    ],
  },
  "/confidentialite": {
    eyebrow: "VOS INFORMATIONS",
    title: "Confidentialité.",
    intro:
      "Présentation provisoire des parcours visibles sur ce site. Une politique complète doit être validée avant l’ouverture commerciale.",
    sections: [
      [
        "Le formulaire public",
        "Le formulaire prépare un récapitulatif dans votre navigateur. Il ne transmet pas de message et ne crée pas de dossier client.",
      ],
      [
        "L’espace connecté",
        "La connexion utilise les services d’authentification configurés pour Yolo. Les finalités, destinataires et durées de conservation des données doivent être précisés dans la politique définitive.",
      ],
      [
        "Vos demandes",
        "Le contact dédié à la protection des données sera ajouté ici. Ne transmettez pas de données sensibles dans la démonstration.",
      ],
    ],
  },
  "/conditions": {
    eyebrow: "CADRE DU SERVICE",
    title: "Conditions d’utilisation.",
    intro:
      "Version de travail informative. Les conditions commerciales définitives restent à compléter et à valider.",
    sections: [
      [
        "La démonstration",
        "Elle permet d’explorer l’interface avec des données fictives. Aucune livraison ni aucun paiement réel n’y est déclenché.",
      ],
      [
        "La plateforme",
        "L’espace connecté est réservé aux utilisateurs autorisés. Chaque utilisateur doit garder ses identifiants confidentiels.",
      ],
      [
        "Avant toute livraison",
        "Le prix, les zones, les objets acceptés, les responsabilités, les modalités de paiement et le traitement des incidents doivent être convenus avant toute prise en charge.",
      ],
    ],
  },
  "/cookies": {
    eyebrow: "VOTRE NAVIGATION",
    title: "Cookies & stockage local.",
    intro:
      "Des informations simples sur le fonctionnement de cette version du site.",
    sections: [
      [
        "Les pages de présentation",
        "Cette version n’ajoute pas d’outil publicitaire ou de mesure d’audience aux pages de présentation. Les animations respectent votre préférence de réduction des mouvements.",
      ],
      [
        "Connexion & démonstration",
        "L’espace connecté peut conserver les éléments nécessaires à votre session dans le navigateur. La démonstration peut mémoriser ses préférences localement.",
      ],
      [
        "Votre navigateur",
        "Vous pouvez supprimer les données du site dans les réglages de votre navigateur. Cela peut déconnecter votre compte ou réinitialiser les préférences.",
      ],
    ],
  },
};
