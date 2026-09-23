import React, { createContext, useContext, useState } from "react";
import { Delivery, DeliveryStatus, DeliveryTimelineEvent } from "@/lib/types";
import { MOCK_DELIVERIES } from "@/lib/mock-data";

export type ActiveNavView =
  | "dashboard"
  | "deliveries"
  | "create_delivery"
  | "delivery_detail"
  | "finances"
  | "pickup_sites"
  | "team"
  | "settings"
  | "support"
  | "tracking_preview";

interface DeliveryContextType {
  deliveries: Delivery[];
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (id: string | null) => void;
  selectedDelivery: Delivery | undefined;
  
  // Handover Modal State (L04)
  handoverDeliveryId: string | null;
  setHandoverDeliveryId: (id: string | null) => void;
  handoverDelivery: Delivery | undefined;

  // Actions
  createDelivery: (newDeliveryData: Partial<Delivery>) => Delivery;
  confirmHandover: (deliveryId: string) => void;
  cancelDelivery: (deliveryId: string, reason: string) => void;
  resolveIncident: (deliveryId: string, resolution: "reassign" | "return") => void;
  viewDeliveryDetail: (deliveryId: string) => void;
  openPublicTracking: (trackingToken: string) => void;
  activeTrackingToken: string | null;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK_DELIVERIES);
  const [activeView, setActiveView] = useState<ActiveNavView>("dashboard");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [handoverDeliveryId, setHandoverDeliveryId] = useState<string | null>(null);
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | null>(null);

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId);
  const handoverDelivery = deliveries.find((d) => d.id === handoverDeliveryId);

  const createDelivery = (data: Partial<Delivery>): Delivery => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `YLO-2026-09-${randomSuffix}`;
    const token = `trk_${randomSuffix}_${Math.random().toString(36).substring(2, 7)}`;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const pickupCode = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    const newDelivery: Delivery = {
      id: `del_${Date.now()}`,
      reference,
      trackingToken: token,
      merchantId: "merch_01",
      pickupSiteId: data.pickupSiteId || "site_akwa",
      pickupSiteName: data.pickupSiteName || "Boutique Centrale Akwa",
      pickupAddress: data.pickupAddress || "128 Bd de la Liberté, Akwa",
      pickupNeighborhood: data.pickupNeighborhood || "Akwa",
      recipientName: data.recipientName || "Nouveau Client",
      recipientPhone: data.recipientPhone || "+237 600 00 00 00",
      recipientAddress: data.recipientAddress || "Douala",
      recipientCity: data.recipientCity || "Douala",
      recipientNeighborhood: data.recipientNeighborhood || "Akwa",
      recipientInstructions: data.recipientInstructions,
      items: data.items || [],
      packageCount: data.packageCount || 1,
      estimatedWeightKg: data.estimatedWeightKg || 1,
      declaredValue: data.declaredValue || 10000,
      isFragile: !!data.isFragile,
      status: "searching_courier",
      createdAt: new Date().toISOString(),
      pickupVerificationCode: pickupCode,
      recipientDeliveryPin: pin,
      paymentMode: data.paymentMode || "prepaid",
      goodsAmount: data.goodsAmount || 0,
      transportFee: data.transportFee || 1500,
      transportPayer: data.transportPayer || "merchant",
      totalToCollect: data.totalToCollect || 0,
      reconciliationStatus: "pending",
      timeline: [
        {
          id: `tl_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          status: "draft",
          title: "Demande créée et confirmée",
          description: "Devis validé. Colis prêts au retrait.",
          actor: "merchant",
        },
        {
          id: `tl_${Date.now() + 1}`,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          status: "searching_courier",
          title: "Recherche de livreur lancée",
          description: "Recherche de coursiers compatibles à proximité via PostGIS.",
          actor: "system",
        },
      ],
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    return newDelivery;
  };

  const confirmHandover = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const newEvent: DeliveryTimelineEvent = {
            id: `tl_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            status: "in_transit",
            title: "Retrait sécurisé confirmé",
            description: `Colis contrôlés et remis au coursier ${del.assignedCourier?.name || "Yolo"}. Prise en charge active.`,
            actor: "merchant",
          };
          return {
            ...del,
            status: "in_transit" as DeliveryStatus,
            actualPickupTime: new Date().toISOString(),
            timeline: [...del.timeline, newEvent],
          };
        }
        return del;
      })
    );
    setHandoverDeliveryId(null);
  };

  const cancelDelivery = (deliveryId: string, reason: string) => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const newEvent: DeliveryTimelineEvent = {
            id: `tl_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            status: "cancelled",
            title: "Course annulée",
            description: `Motif : ${reason}. Droits et attribution révoqués.`,
            actor: "merchant",
          };
          return {
            ...del,
            status: "cancelled" as DeliveryStatus,
            timeline: [...del.timeline, newEvent],
          };
        }
        return del;
      })
    );
  };

  const resolveIncident = (deliveryId: string, resolution: "reassign" | "return") => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const nextStatus: DeliveryStatus = resolution === "return" ? "return_in_progress" : "searching_courier";
          const newEvent: DeliveryTimelineEvent = {
            id: `tl_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            status: nextStatus,
            title: resolution === "return" ? "Mission de retour engagée" : "Nouvelle recherche livreur",
            description:
              resolution === "return"
                ? `Retour autorisé vers le point de retrait ${del.pickupSiteName}.`
                : "Réattribution ordonnée par l'exploitation.",
            actor: "support",
          };
          return {
            ...del,
            status: nextStatus,
            timeline: [...del.timeline, newEvent],
          };
        }
        return del;
      })
    );
  };

  const viewDeliveryDetail = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setActiveView("delivery_detail");
  };

  const openPublicTracking = (trackingToken: string) => {
    setActiveTrackingToken(trackingToken);
    setActiveView("tracking_preview");
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        activeView,
        setActiveView,
        selectedDeliveryId,
        setSelectedDeliveryId,
        selectedDelivery,
        handoverDeliveryId,
        setHandoverDeliveryId,
        handoverDelivery,
        createDelivery,
        confirmHandover,
        cancelDelivery,
        resolveIncident,
        viewDeliveryDetail,
        openPublicTracking,
        activeTrackingToken,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDeliveries() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error("useDeliveries must be used within a DeliveryProvider");
  }
  return context;
}
