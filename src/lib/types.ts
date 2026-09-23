export type UserRole = "owner" | "manager" | "preparer" | "accountant";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  avatarInitials: string;
  avatarColor: string;
  accessibleSiteIds: string[]; // empty means all sites
}

export interface Merchant {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  category: "restaurant" | "retail" | "ecommerce" | "pharmacy" | "grocery";
  categoryLabel: string;
  phone: string;
  email: string;
  address: string;
  city: "Douala" | "Yaoundé";
  status: "active" | "pending_approval" | "suspended";
  currency: "FCFA";
  contractRateDiscount: number;
  mobileMoneyAccount: {
    provider: "MTN MoMo" | "Orange Money";
    number: string;
    verified: boolean;
  };
  bankAccount?: {
    bankName: string;
    ibanOrRib: string;
    verified: boolean;
  };
}

export interface PickupSite {
  id: string;
  merchantId: string;
  name: string;
  address: string;
  city: "Douala" | "Yaoundé";
  neighborhood: string;
  lat: number;
  lng: number;
  contactName: string;
  contactPhone: string;
  instructions: string;
  openingHours: string;
  active: boolean;
  isDefault: boolean;
}

export type DeliveryStatus =
  | "draft"
  | "scheduled"
  | "preparing"
  | "ready_for_pickup"
  | "searching_courier"
  | "courier_assigned"
  | "at_pickup"
  | "in_transit"
  | "at_destination"
  | "delivered"
  | "incident"
  | "return_in_progress"
  | "returned"
  | "cancelled";

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicleType: "moto" | "scooter" | "voiture" | "van";
  plateNumber: string;
  rating: number;
  avatarUrl?: string;
  verified: boolean;
  estimatedArrivalMinutes?: number;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  category: "food" | "general_goods" | "electronics" | "fragile" | "documents";
  weightKg?: number;
}

export interface DeliveryTimelineEvent {
  id: string;
  timestamp: string;
  status: DeliveryStatus;
  title: string;
  description: string;
  actor: "merchant" | "courier" | "system" | "recipient" | "support";
  actorName?: string;
}

export interface Delivery {
  id: string;
  reference: string; // e.g. YLO-2026-09-4821
  trackingToken: string; // For public link /suivi/:token
  merchantId: string;
  pickupSiteId: string;
  pickupSiteName: string;
  pickupAddress: string;
  pickupNeighborhood: string;
  
  // Recipient
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: "Douala" | "Yaoundé";
  recipientNeighborhood: string;
  recipientInstructions?: string;

  // Parcel & Cargo
  items: DeliveryItem[];
  packageCount: number;
  estimatedWeightKg: number;
  declaredValue: number;
  isFragile: boolean;

  // Status & Handover
  status: DeliveryStatus;
  createdAt: string;
  scheduledPickupTime?: string;
  actualPickupTime?: string;
  deliveredTime?: string;
  
  // Security Handover Codes
  pickupVerificationCode: string; // 6-digit PIN given to merchant to verify courier
  recipientDeliveryPin: string; // 4-digit PIN recipient hands to courier upon delivery

  // Courier
  assignedCourier?: Courier;

  // Pricing & Cash On Delivery
  paymentMode: "prepaid" | "cash_on_delivery";
  goodsAmount: number; // Montant marchandise
  transportFee: number; // Frais transport Yolo
  transportPayer: "merchant" | "recipient";
  totalToCollect: number; // Montant à collecter chez le destinataire
  cashCollected?: number;
  collectionMethod?: "MTN MoMo" | "Orange Money" | "Cash";

  // Financial Reconciliation
  reconciliationStatus: "pending" | "reconciled_j0" | "discrepancy" | "payout_ready";
  payoutId?: string;

  // Incident or Return
  incidentReason?: string;
  incidentNotes?: string;
  isReturnInitiated?: boolean;

  timeline: DeliveryTimelineEvent[];
}

export interface FinanceMovement {
  id: string;
  date: string;
  reference: string;
  deliveryReference?: string;
  type: "cod_collection" | "transport_fee_debit" | "payout_credit" | "adjustment";
  typeLabel: string;
  amount: number;
  isCredit: boolean;
  channel: "MTN MoMo" | "Orange Money" | "SYSTAC / Virement" | "Compte Yolo" | "Espèces";
  status: "effectué" | "en_cours" | "anomalie";
  description: string;
}

export interface Invoice {
  id: string;
  number: string;
  period: string;
  totalDeliveries: number;
  totalTransportFees: number;
  taxAmount: number;
  netPayable: number;
  status: "payée" | "en_attente" | "échue";
  dueDate: string;
  downloadUrl?: string;
}

export interface Payout {
  id: string;
  reference: string;
  period: string;
  grossCodAmount: number;
  netPayoutAmount: number;
  deductedFees: number;
  method: "MTN MoMo" | "Orange Money" | "Virement Bancaire";
  accountNumber: string;
  status: "virement_effectué" | "programmé" | "en_rapprochement";
  date: string;
  traceId: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  deliveryReference?: string;
  category: "courier_delay" | "damaged_parcel" | "recipient_absent" | "payment_issue" | "general";
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "urgent";
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
}
