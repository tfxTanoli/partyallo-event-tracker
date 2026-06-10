export type EventStatus = 'Planning' | 'Packing' | 'In progress' | 'Completed';
export type PackingItemCategory = 'default' | 'Live station' | 'Fresh food' | 'Others';
export type LiveStationCategory =
  | 'Food Live Station'
  | 'Drinks Live Station'
  | 'Desserts Live Station'
  | 'Party Package'
  | 'Craft Workshop'
  | 'Others';
export type PurchaseCategory = 'Frozen' | 'Room temp goods' | 'Fridge';
export type PurchaseSupplier =
  | 'NTUC / SS'
  | 'Whatsapp Supplier'
  | 'Online purchases'
  | 'Others';

export interface PackingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: PackingItemCategory;
  notes?: string;
  stationName?: string;
  isPacked: boolean;
  isLoaded: boolean;
  packedBy?: string;
  packedAt?: string;
  isFixed: boolean;
  baseQty: number;
  isToPack: boolean;
}

export interface LiveStation {
  id: string;
  name: string;
  category: LiveStationCategory;
  description?: string;
  defaultPackingList: PackingItem[];
  powerRequired?: string;
  helperCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackingLog {
  id: string;
  timestamp: string;
  packerName: string;
  action: string;
}

export interface Event {
  id: string;
  clientName: string;
  eventName: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  setupTime: string;
  assignedStationIds: string[];
  packingList: PackingItem[];
  status: EventStatus;
  servings: number;
  stationServings: Record<string, number>;
  categoryPackedIn: Record<string, string>;
  logs: PackingLog[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRegistryItem {
  id: string;
  name: string;
  qtyNeeded: number;
  unit: string;
  notes?: string;
  requiredDate?: string;
  category: PurchaseCategory;
  supplier: PurchaseSupplier;
  purchased: boolean;
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  appSubtitle: string;
  logoUri?: string;
}

// Navigation param lists
export type RootTabParamList = {
  Dashboard: undefined;
  Events: undefined;
  Catalog: undefined;
  Packing: undefined;
  Purchases: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventForm: { eventId?: string };
};

export type CatalogStackParamList = {
  CatalogList: undefined;
  StationForm: { stationId?: string };
};

export type PackingStackParamList = {
  PackingHome: undefined;
  StationSelector: { eventId: string };
  PackingChecklist: { eventId: string; stationId: string };
};
