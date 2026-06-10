import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Event, LiveStation, PurchaseRegistryItem, AppSettings, PackingItem } from '../types';
import { MOCK_EVENTS, MOCK_STATIONS, MOCK_PURCHASES } from '../data/mockData';
import { loadData, saveData, KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface AppState {
  events: Event[];
  stations: LiveStation[];
  purchases: PurchaseRegistryItem[];
  settings: AppSettings;
  currentPacker: string;
  selectedEventId: string | null;
  isLoading: boolean;
}

type Action =
  | { type: 'INIT'; payload: Partial<AppState> }
  | { type: 'SET_EVENTS'; events: Event[] }
  | { type: 'ADD_EVENT'; event: Event }
  | { type: 'UPDATE_EVENT'; event: Event }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'SET_STATIONS'; stations: LiveStation[] }
  | { type: 'ADD_STATION'; station: LiveStation }
  | { type: 'UPDATE_STATION'; station: LiveStation }
  | { type: 'DELETE_STATION'; id: string }
  | { type: 'SET_PURCHASES'; purchases: PurchaseRegistryItem[] }
  | { type: 'ADD_PURCHASE'; purchase: PurchaseRegistryItem }
  | { type: 'UPDATE_PURCHASE'; purchase: PurchaseRegistryItem }
  | { type: 'DELETE_PURCHASE'; id: string }
  | { type: 'SET_PACKER'; name: string }
  | { type: 'SELECT_EVENT'; id: string | null }
  | { type: 'UPDATE_PACKING_ITEM'; eventId: string; item: PackingItem }
  | { type: 'MARK_ALL_PACKED'; eventId: string; stationName: string };

const defaultSettings: AppSettings = {
  companyName: 'PartyAllo',
  appSubtitle: 'Event Packing Tracker',
};

const initialState: AppState = {
  events: MOCK_EVENTS,
  stations: MOCK_STATIONS,
  purchases: MOCK_PURCHASES,
  settings: defaultSettings,
  currentPacker: '',
  selectedEventId: null,
  isLoading: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, isLoading: false };

    case 'SET_EVENTS':
      return { ...state, events: action.events };

    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.event.id ? action.event : e)),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.id),
        selectedEventId: state.selectedEventId === action.id ? null : state.selectedEventId,
      };

    case 'SET_STATIONS':
      return { ...state, stations: action.stations };

    case 'ADD_STATION':
      return { ...state, stations: [action.station, ...state.stations] };

    case 'UPDATE_STATION':
      return {
        ...state,
        stations: state.stations.map((s) => (s.id === action.station.id ? action.station : s)),
      };

    case 'DELETE_STATION':
      return { ...state, stations: state.stations.filter((s) => s.id !== action.id) };

    case 'SET_PURCHASES':
      return { ...state, purchases: action.purchases };

    case 'ADD_PURCHASE':
      return { ...state, purchases: [action.purchase, ...state.purchases] };

    case 'UPDATE_PURCHASE':
      return {
        ...state,
        purchases: state.purchases.map((p) => (p.id === action.purchase.id ? action.purchase : p)),
      };

    case 'DELETE_PURCHASE':
      return { ...state, purchases: state.purchases.filter((p) => p.id !== action.id) };

    case 'SET_PACKER':
      return { ...state, currentPacker: action.name };

    case 'SELECT_EVENT':
      return { ...state, selectedEventId: action.id };

    case 'UPDATE_PACKING_ITEM': {
      const updatedEvents = state.events.map((ev) => {
        if (ev.id !== action.eventId) return ev;
        return {
          ...ev,
          packingList: ev.packingList.map((item) =>
            item.id === action.item.id ? action.item : item
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, events: updatedEvents };
    }

    case 'MARK_ALL_PACKED': {
      const updatedEvents = state.events.map((ev) => {
        if (ev.id !== action.eventId) return ev;
        return {
          ...ev,
          packingList: ev.packingList.map((item) =>
            item.stationName === action.stationName && item.isToPack
              ? { ...item, isPacked: true, packedBy: state.currentPacker, packedAt: new Date().toISOString() }
              : item
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, events: updatedEvents };
    }

    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  getEventById: (id: string) => Event | undefined;
  getStationById: (id: string) => LiveStation | undefined;
  createEvent: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  createStation: (data: Omit<LiveStation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStation: (station: LiveStation) => void;
  deleteStation: (id: string) => void;
  createPurchase: (data: Omit<PurchaseRegistryItem, 'id' | 'createdAt'>) => void;
  updatePurchase: (purchase: PurchaseRegistryItem) => void;
  deletePurchase: (id: string) => void;
  togglePurchased: (id: string) => void;
  selectEventForPacking: (id: string | null) => void;
  setCurrentPacker: (name: string) => void;
  updatePackingItem: (eventId: string, item: PackingItem) => void;
  markAllPacked: (eventId: string, stationName: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const [events, stations, purchases, settings, packer] = await Promise.all([
        loadData<Event[]>(KEYS.EVENTS, MOCK_EVENTS),
        loadData<LiveStation[]>(KEYS.STATIONS, MOCK_STATIONS),
        loadData<PurchaseRegistryItem[]>(KEYS.PURCHASES, MOCK_PURCHASES),
        loadData<AppSettings>(KEYS.SETTINGS, defaultSettings),
        loadData<string>(KEYS.PACKER, ''),
      ]);
      dispatch({ type: 'INIT', payload: { events, stations, purchases, settings, currentPacker: packer } });
    })();
  }, []);

  // Persist to AsyncStorage on changes
  useEffect(() => {
    if (!state.isLoading) saveData(KEYS.EVENTS, state.events);
  }, [state.events, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) saveData(KEYS.STATIONS, state.stations);
  }, [state.stations, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) saveData(KEYS.PURCHASES, state.purchases);
  }, [state.purchases, state.isLoading]);

  const getEventById = (id: string) => state.events.find((e) => e.id === id);
  const getStationById = (id: string) => state.stations.find((s) => s.id === id);

  const createEvent = (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => {
    const event: Event = {
      ...data,
      id: `evt-${generateId()}`,
      logs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EVENT', event });
  };

  const updateEvent = (event: Event) => {
    dispatch({ type: 'UPDATE_EVENT', event: { ...event, updatedAt: new Date().toISOString() } });
  };

  const deleteEvent = (id: string) => dispatch({ type: 'DELETE_EVENT', id });

  const createStation = (data: Omit<LiveStation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const station: LiveStation = {
      ...data,
      id: `sta-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_STATION', station });
  };

  const updateStation = (station: LiveStation) => {
    dispatch({ type: 'UPDATE_STATION', station: { ...station, updatedAt: new Date().toISOString() } });
  };

  const deleteStation = (id: string) => dispatch({ type: 'DELETE_STATION', id });

  const createPurchase = (data: Omit<PurchaseRegistryItem, 'id' | 'createdAt'>) => {
    const purchase: PurchaseRegistryItem = {
      ...data,
      id: `pur-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PURCHASE', purchase });
  };

  const updatePurchase = (purchase: PurchaseRegistryItem) =>
    dispatch({ type: 'UPDATE_PURCHASE', purchase });

  const deletePurchase = (id: string) => dispatch({ type: 'DELETE_PURCHASE', id });

  const togglePurchased = (id: string) => {
    const item = state.purchases.find((p) => p.id === id);
    if (item) dispatch({ type: 'UPDATE_PURCHASE', purchase: { ...item, purchased: !item.purchased } });
  };

  const selectEventForPacking = (id: string | null) => dispatch({ type: 'SELECT_EVENT', id });

  const setCurrentPacker = (name: string) => {
    dispatch({ type: 'SET_PACKER', name });
    saveData(KEYS.PACKER, name);
  };

  const updatePackingItem = (eventId: string, item: PackingItem) =>
    dispatch({ type: 'UPDATE_PACKING_ITEM', eventId, item });

  const markAllPacked = (eventId: string, stationName: string) =>
    dispatch({ type: 'MARK_ALL_PACKED', eventId, stationName });

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
        getEventById,
        getStationById,
        createEvent,
        updateEvent,
        deleteEvent,
        createStation,
        updateStation,
        deleteStation,
        createPurchase,
        updatePurchase,
        deletePurchase,
        togglePurchased,
        selectEventForPacking,
        setCurrentPacker,
        updatePackingItem,
        markAllPacked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
