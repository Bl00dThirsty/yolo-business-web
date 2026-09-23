import {
  Merchant,
  PickupSite,
  UserProfile,
  Delivery,
  FinanceMovement,
  Invoice,
  Payout,
  SupportTicket,
} from "./types";

export const MOCK_USERS: UserProfile[] = [
  {
    id: "usr_1",
    name: "Patrick Nguemo",
    email: "p.nguemo@boulangeriemoderne.cm",
    phone: "+237 699 45 12 30",
    role: "owner",
    roleLabel: "Propriétaire",
    avatarInitials: "PN",
    avatarColor: "bg-yolo-lime text-yolo-ink",
    accessibleSiteIds: [],
  },
  {
    id: "usr_2",
    name: "Carine Mbida",
    email: "c.mbida@boulangeriemoderne.cm",
    phone: "+237 677 82 91 04",
    role: "manager",
    roleLabel: "Gestionnaire de site",
    avatarInitials: "CM",
    avatarColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    accessibleSiteIds: ["site_akwa", "site_bonapriso"],
  },
  {
    id: "usr_3",
    name: "Samuel Enyegue",
    email: "s.enyegue@boulangeriemoderne.cm",
    phone: "+237 690 14 38 72",
    role: "preparer",
    roleLabel: "Préparateur de commandes",
    avatarInitials: "SE",
    avatarColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    accessibleSiteIds: ["site_akwa"],
  },
  {
    id: "usr_4",
    name: "Henriette Eyenga",
    email: "h.eyenga@boulangeriemoderne.cm",
    phone: "+237 675 22 67 89",
    role: "accountant",
    roleLabel: "Comptable & Trésorière",
    avatarInitials: "HE",
    avatarColor: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    accessibleSiteIds: [],
  },
];

export const MOCK_MERCHANT: Merchant = {
  id: "merch_01",
  name: "Boulangerie & Épicerie Fine Moderne",
  legalName: "SARL Les Délices d'Afrique",
  taxId: "M051800049281X",
  category: "restaurant",
  categoryLabel: "Alimentation & Traiteur",
  phone: "+237 699 45 12 30",
  email: "contact@boulangeriemoderne.cm",
  address: "Boulevard de la Liberté, Akwa",
  city: "Douala",
  status: "active",
  currency: "FCFA",
  contractRateDiscount: 10,
  mobileMoneyAccount: {
    provider: "MTN MoMo",
    number: "+237 677 00 11 22",
    verified: true,
  },
  bankAccount: {
    bankName: "Afriland First Bank (Siège Douala)",
    ibanOrRib: "CM21 10005 00012 049281001 45",
    verified: true,
  },
};

export const MOCK_PICKUP_SITES: PickupSite[] = [
  {
    id: "site_akwa",
    merchantId: "merch_01",
    name: "Boutique Centrale Akwa",
    address: "128 Boulevard de la Liberté, face Direction Orange",
    city: "Douala",
    neighborhood: "Akwa",
    lat: 4.0511,
    lng: 9.7085,
    contactName: "Samuel Enyegue",
    contactPhone: "+237 690 14 38 72",
    instructions: "Entrée côté comptoir retrait coursier, sonner à la cloche Yolo.",
    openingHours: "Lun - Sam : 07h00 - 21h00",
    active: true,
    isDefault: true,
  },
  {
    id: "site_bonapriso",
    merchantId: "merch_01",
    name: "Atelier Traiteur Bonapriso",
    address: "Rue Tokoto, face Clinique de la Gare",
    city: "Douala",
    neighborhood: "Bonapriso",
    lat: 4.0289,
    lng: 9.6974,
    contactName: "Carine Mbida",
    contactPhone: "+237 677 82 91 04",
    instructions: "Dépose-minute disponible. Retrait sur présentation du QR code.",
    openingHours: "Lun - Dim : 08h00 - 22h00",
    active: true,
    isDefault: false,
  },
  {
    id: "site_bonamoussadi",
    merchantId: "merch_01",
    name: "Point Retrait Bonamoussadi",
    address: "Rond-point Denver, Immeuble Horizon 1er étage",
    city: "Douala",
    neighborhood: "Bonamoussadi",
    lat: 4.0845,
    lng: 9.7341,
    contactName: "Pauline Tchinda",
    contactPhone: "+237 693 40 18 55",
    instructions: "Accès par l'escalier extérieur.",
    openingHours: "Mar - Dim : 09h00 - 20h00",
    active: true,
    isDefault: false,
  },
  {
    id: "site_bastos",
    merchantId: "merch_01",
    name: "Comptoir Bastos (Yaoundé)",
    address: "Rue Joseph Mballa Eloumden, Bastos",
    city: "Yaoundé",
    neighborhood: "Bastos",
    lat: 3.8821,
    lng: 11.5167,
    contactName: "Jean-Marc Fouda",
    contactPhone: "+237 655 12 78 90",
    instructions: "Près de l'Ambassade de Suisse.",
    openingHours: "Lun - Sam : 08h30 - 19h30",
    active: true,
    isDefault: false,
  },
];

// Données initialisées vides pour tests directs
export const MOCK_DELIVERIES: Delivery[] = [];

export const MOCK_FINANCE_MOVEMENTS: FinanceMovement[] = [];

export const MOCK_INVOICES: Invoice[] = [];

export const MOCK_PAYOUTS: Payout[] = [];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [];

// Données analytiques initiales
export const MONTHLY_DELIVERY_DATA: {
  month: string;
  deliveries: number;
  codAmount: number;
  fees: number;
  successRate: number;
}[] = [];

export const PICKUP_SITE_DISTRIBUTION: {
  name: string;
  value: number;
  color: string;
}[] = [];

export const CATEGORY_DISTRIBUTION: {
  name: string;
  value: number;
  color: string;
}[] = [];

export const SITE_PERFORMANCE_METRICS: {
  site: string;
  deliveries: string;
  avgPickupTime: string;
  successRate: string;
  totalCod: string;
  activeCouriers: number;
}[] = [];
