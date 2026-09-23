import React, { createContext, useContext, useState } from "react";
import { Merchant, PickupSite } from "@/lib/types";
import { MOCK_MERCHANT, MOCK_PICKUP_SITES } from "@/lib/mock-data";

interface StoreContextType {
  merchant: Merchant;
  pickupSites: PickupSite[];
  selectedSiteId: string; // 'all' or site id
  setSelectedSiteId: (siteId: string) => void;
  selectedSite?: PickupSite;
  addPickupSite: (site: Omit<PickupSite, "id" | "merchantId">) => void;
  updatePickupSite: (id: string, updates: Partial<PickupSite>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [merchant] = useState<Merchant>(MOCK_MERCHANT);
  const [pickupSites, setPickupSites] = useState<PickupSite[]>(MOCK_PICKUP_SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("all");

  const selectedSite = pickupSites.find((s) => s.id === selectedSiteId);

  const addPickupSite = (siteData: Omit<PickupSite, "id" | "merchantId">) => {
    const newSite: PickupSite = {
      ...siteData,
      id: `site_${Date.now()}`,
      merchantId: merchant.id,
    };
    setPickupSites((prev) => [...prev, newSite]);
  };

  const updatePickupSite = (id: string, updates: Partial<PickupSite>) => {
    setPickupSites((prev) =>
      prev.map((site) => (site.id === id ? { ...site, ...updates } : site))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        merchant,
        pickupSites,
        selectedSiteId,
        setSelectedSiteId,
        selectedSite,
        addPickupSite,
        updatePickupSite,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
