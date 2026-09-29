export const SITE_URL = "https://business.yolo-hub.com";
export const SITE_NAME = "Yolo Business";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogType?: "website" | "article";
  image?: string;
}

export const SEO_PAGES_META: Record<string, PageMetadata> = {
  "/": {
    title: "Yolo Business — Solution de Livraison Express pour Commerces au Cameroun",
    description:
      "Organisez vos livraisons locales avec Yolo Business. Prise en charge rapide à Yaoundé & Douala, suivi en temps réel et remise sécurisée par code pour vos clients.",
    keywords:
      "livraison express Cameroun, livraison Yaoundé, livraison Douala, livraison e-commerce Cameroun, logistique dernier kilomètre, coursier entreprise Cameroun, Yolo Business",
  },
  "/solution": {
    title: "La Solution de Livraison Pro — Yolo Business",
    description:
      "Découvrez la solution Yolo Business : un espace centralisé pour programmer vos départs de colis, suivre vos courses et fluidifier vos expéditions commerciales.",
    keywords:
      "solution livraison entreprise, plateforme logistique Cameroun, gestion colis commerce Yaoundé",
  },
  "/entreprises": {
    title: "Livraison pour Commerces, Boutiques & E-commerce — Yolo Business",
    description:
      "Boutiques de quartier, vendeurs Instagram/WhatsApp ou sites e-commerce : offrez une livraison rapide et fiable à vos clients à Yaoundé.",
    keywords:
      "livraison boutique Yaoundé, livraison vendeur WhatsApp, e-commerce Cameroun logistique",
  },
  "/fonctionnement": {
    title: "Comment ça Marche ? Le Parcours de Livraison — Yolo Business",
    description:
      "Trois étapes simples : préparez vos colis au magasin, un livreur Yolo prend le relais et votre client réceptionne avec un code de confirmation sécurisé.",
    keywords:
      "fonctionnement livraison Yolo, étiquetage colis, remise sécurisée code livraison",
  },
  "/tarifs": {
    title: "Tarifs de Livraison & Formules Commerçants — Yolo Business",
    description:
      "À la course, formules au quotidien ou offres sur-mesure pour vos volumes réguliers. Des tarifs transparents adaptés à votre activité à Yaoundé.",
    keywords:
      "tarif livraison Cameroun, prix coursier Yaoundé, forfait livraison e-commerce",
  },
  "/zones": {
    title: "Zones & Quartiers Couverts à Yaoundé — Yolo Business",
    description:
      "Couverture de livraison à Yaoundé : Bastos, Bonas, Omnisports, Essos, Mvan, Biyem-Assi... Vérifiez la faisabilité et les axes de livraison.",
    keywords:
      "zones livraison Yaoundé, quartiers desservis Bastos Omnisports, coursier Yaoundé centre",
  },
  "/ressources": {
    title: "Guides Pratiques & Conseils Logistiques — Yolo Business",
    description:
      "Astuces et conseils de commerçants : préparer un colis résistant, réussir le repérage d’adresse à Yaoundé et organiser les expéditions de pointe.",
    keywords:
      "conseils logistique commerçant, guide emballage colis, adressage urbain Yaoundé",
  },
  "/faq": {
    title: "Questions Fréquentes (FAQ) — Yolo Business",
    description:
      "Toutes les réponses à vos questions : comment démarrer, zones couvertes, qui paie les frais, suivi WhatsApp et validation de commande.",
    keywords:
      "FAQ livraison Yolo, questions livraison Cameroun, aide expédition commerçant",
  },
  "/a-propos": {
    title: "À Propos de Yolo Business — Notre Vision de la Livraison Urbaine",
    description:
      "Yolo Business est un projet logistique né au Cameroun pour simplifier le lien entre commerçants, coursiers professionnels et acheteurs urbains.",
    keywords:
      "à propos Yolo Delivery, startup logistique Cameroun, équipe livraison Yaoundé",
  },
  "/partenaires": {
    title: "Devenir Partenaire ou Coursier — Yolo Business",
    description:
      "Livreurs indépendants, flottes ou partenaires institutionnels : découvrez comment collaborer avec Yolo Business au Cameroun.",
    keywords:
      "recrutement coursier Yaoundé, partenaire transport Cameroun, devenir livreur Yolo",
  },
  "/contact": {
    title: "Contactez l'Équipe Yolo Business — Parlons de vos Livraisons",
    description:
      "Besoin d'un accompagnement ou d'activer votre boutique ? Remplissez notre formulaire pour échanger avec l'équipe commerciale Yolo.",
    keywords:
      "contact Yolo Business, activer point de retrait, service client livraison Cameroun",
  },
  "/demo": {
    title: "Démonstration Interactive de la Plateforme — Yolo Business",
    description:
      "Explorez l'interface de gestion Yolo Business : créez une livraison test, consultez le tableau de bord et le suivi comptable en direct.",
  },
  "/mentions-legales": {
    title: "Mentions Légales — Yolo Business",
    description: "Informations légales et éditeur du site web Yolo Business.",
  },
  "/confidentialite": {
    title: "Politique de Confidentialité — Yolo Business",
    description: "Protection de vos données et gestion des informations sur la plateforme Yolo Business.",
  },
};

/**
 * Met à jour dynamiquement les balises SEO dans le DOM (Title, Meta Description, Canonical, OG tags, Twitter tags)
 */
export function updatePageSEO(meta: PageMetadata, currentPath: string) {
  const fullUrl = `${SITE_URL}${currentPath === "/" ? "" : currentPath}`;
  const title = meta.title;
  const description = meta.description;
  const image = meta.image || DEFAULT_OG_IMAGE;
  const ogType = meta.ogType || "website";

  // 1. Title
  document.title = title;

  // 2. Helper to set or create meta
  const setMeta = (nameAttr: "name" | "property", nameValue: string, contentValue: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${nameValue}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(nameAttr, nameValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", contentValue);
  };

  setMeta("name", "description", description);
  if (meta.keywords) {
    setMeta("name", "keywords", meta.keywords);
  }

  // OpenGraph
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", fullUrl);
  setMeta("property", "og:type", ogType);
  setMeta("property", "og:image", image);
  setMeta("property", "og:site_name", SITE_NAME);

  // Twitter
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  // 3. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute("href", fullUrl);
}

/**
 * Données structurées globales Schema.org pour Google
 */
export function getStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "DeliveryService",
      "name": "Yolo Business",
      "legalName": "Yolo Delivery",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo-yolo-black.png`,
      "image": DEFAULT_OG_IMAGE,
      "description":
        "Service de livraison express et logistique urbaine pour commerces et e-commerce au Cameroun (Yaoundé & Douala).",
      "areaServed": [
        {
          "@type": "City",
          "name": "Yaoundé",
          "addressCountry": "CM",
        },
        {
          "@type": "City",
          "name": "Douala",
          "addressCountry": "CM",
        },
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Yaoundé",
        "addressCountry": "CM",
      },
      "serviceType": "Livraison express du dernier kilomètre pour commerces",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Yolo Business",
      "url": SITE_URL,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/ressources?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}
