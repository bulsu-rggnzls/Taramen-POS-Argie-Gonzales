import { create } from "zustand";

const initialCustomizeState = {
  isOpen: false,
  itemId: null,
  addons: [],
  removals: [],
  note: "",
  newAddon: { label: "", price: "" },
  newRemoval: { label: "" },
};

const initialState = {
  tableNumber: "14",
  employeeId: "",
  discountValue: "none",
  promoDiscountValue: "none",
  dineType: "dine-in",
  orderItems: [],
  selectedCategory: "all",
  searchTerm: "",
  customize: initialCustomizeState,
  customData: { addons: [], removals: [] },
};

const useTakeOrderStore = create((set) => ({
  ...initialState,

  setTable: (tableNumber) => set({ tableNumber }),
  setEmployee: (employeeId) => set({ employeeId }),
  setDiscountValue: (discountValue) => set({ discountValue }),
  setPromoDiscountValue: (promoDiscountValue) => set({ promoDiscountValue }),
  setDiscounts: (discountValue, promoDiscountValue) =>
    set({ discountValue, promoDiscountValue }),
  setDineType: (dineType) => set({ dineType }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),

  setCustomizeNote: (note) =>
    set((state) => ({
      customize: { ...state.customize, note },
    })),
  setNewAddonLabel: (label) =>
    set((state) => ({
      customize: {
        ...state.customize,
        newAddon: { ...state.customize.newAddon, label },
      },
    })),
  setNewAddonPrice: (price) =>
    set((state) => ({
      customize: {
        ...state.customize,
        newAddon: { ...state.customize.newAddon, price },
      },
    })),
  setNewRemovalLabel: (label) =>
    set((state) => ({
      customize: {
        ...state.customize,
        newRemoval: { label },
      },
    })),

  ensureEmployeeId: (employeeId) =>
    set((state) => (state.employeeId ? state : { employeeId: String(employeeId) })),

  addItem: (menuItem) =>
    set((state) => {
      const existing = state.orderItems.find((item) => item.id === menuItem.id);

      if (existing) {
        return {
          orderItems: state.orderItems.map((item) =>
            item.id === menuItem.id ? { ...item, qty: item.qty + 1 } : item,
          ),
        };
      }

      return {
        orderItems: [
          ...state.orderItems,
          {
            id: menuItem.id,
            name: menuItem.name,
            details: menuItem.description ?? "",
            price: Number(menuItem.price) || 0,
            qty: 1,
            accent: menuItem.accent,
            addons: [],
            removals: [],
            note: "",
          },
        ],
      };
    }),

  changeItemQty: (id, delta) =>
    set((state) => ({
      orderItems: state.orderItems
        .map((item) => {
          if (item.id !== id) return item;
          return { ...item, qty: item.qty + delta };
        })
        .filter((item) => item.qty > 0),
    })),

  openCustomize: (item) =>
    set((state) => ({
      customize: {
        ...initialCustomizeState,
        isOpen: true,
        itemId: item.id,
        addons: item.addons?.map((addon) => addon.id) ?? [],
        removals: item.removals?.map((removal) => removal.id) ?? [],
        note: item.note ?? "",
      },
      customData: state.customData,
    })),

  closeCustomize: () =>
    set((state) => ({
      customize: initialCustomizeState,
      customData: state.customData,
    })),

  toggleAddon: (addonId, checked) =>
    set((state) => ({
      customize: {
        ...state.customize,
        addons: checked
          ? Array.from(new Set([...state.customize.addons, addonId]))
          : state.customize.addons.filter((id) => id !== addonId),
      },
    })),

  toggleRemoval: (removalId, checked) =>
    set((state) => ({
      customize: {
        ...state.customize,
        removals: checked
          ? Array.from(new Set([...state.customize.removals, removalId]))
          : state.customize.removals.filter((id) => id !== removalId),
      },
    })),

  addCustomAddon: () =>
    set((state) => {
      const label = state.customize.newAddon.label.trim();
      if (!label) return state;

      const id = `custom-addon-${Date.now()}`;
      const price = Number(state.customize.newAddon.price) || 0;

      return {
        customData: {
          ...state.customData,
          addons: [...state.customData.addons, { id, label, price }],
        },
        customize: {
          ...state.customize,
          addons: [...state.customize.addons, id],
          newAddon: { label: "", price: "" },
        },
      };
    }),

  addCustomRemoval: () =>
    set((state) => {
      const label = state.customize.newRemoval.label.trim();
      if (!label) return state;

      const id = `custom-removal-${Date.now()}`;

      return {
        customData: {
          ...state.customData,
          removals: [...state.customData.removals, { id, label }],
        },
        customize: {
          ...state.customize,
          removals: [...state.customize.removals, id],
          newRemoval: { label: "" },
        },
      };
    }),

  applyCustomization: (baseAddons, baseRemovals) =>
    set((state) => {
      const { itemId, addons, removals, note } = state.customize;
      if (!itemId) return state;

      const finalAddons = [...baseAddons, ...state.customData.addons].filter((addon) =>
        addons.includes(addon.id),
      );
      const finalRemovals = [...baseRemovals, ...state.customData.removals].filter(
        (removal) => removals.includes(removal.id),
      );

      return {
        orderItems: state.orderItems.map((item) =>
          item.id === itemId
            ? { ...item, addons: finalAddons, removals: finalRemovals, note: note.trim() }
            : item,
        ),
        customize: initialCustomizeState,
      };
    }),

  clearOrder: () => set(initialState),
  clearSubmittedOrder: () =>
    set((state) => ({
      ...initialState,
      employeeId: state.employeeId,
    })),
}));

export const getCustomizeItem = (state) =>
  state.orderItems.find((item) => item.id === state.customize.itemId) ?? null;

export default useTakeOrderStore;
