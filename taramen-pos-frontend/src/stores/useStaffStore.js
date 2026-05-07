import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const initialState = {
  tableNumber: "14",
  employeeId: "",
  discountValue: "none",
  promoDiscountValue: "none",
  dineType: "dine-in",
  orderItems: [],
  searchTerm: "",
  activeCategory: "all",
  isCustomizeModalOpen: false,
  customizingItemId: null,
};

export const useStaffStore = create(
  immer((set) => ({
    ...initialState,

    setField: (key, value) =>
      set((state) => {
        state[key] = value;
      }),

    ensureEmployeeId: (employeeId) =>
      set((state) => {
        if (!state.employeeId) {
          state.employeeId = String(employeeId);
        }
      }),

    addItem: (menuItem) =>
      set((state) => {
        const existing = state.orderItems.find((item) => item.id === menuItem.id);

        if (existing) {
          existing.qty += 1;
          return;
        }

        state.orderItems.push({
          id: menuItem.id,
          name: menuItem.name,
          details: menuItem.description ?? "",
          price: Number(menuItem.price) || 0,
          qty: 1,
          accent: menuItem.accent,
          addons: [],
          removals: [],
          note: "",
        });
      }),

    changeItemQty: (id, delta) =>
      set((state) => {
        const item = state.orderItems.find((orderItem) => orderItem.id === id);
        if (!item) return;

        item.qty += delta;
        state.orderItems = state.orderItems.filter((orderItem) => orderItem.qty > 0);
      }),

    removeItem: (id) =>
      set((state) => {
        state.orderItems = state.orderItems.filter((item) => item.id !== id);
      }),

    openCustomizeModal: (itemId) =>
      set((state) => {
        state.customizingItemId = itemId;
        state.isCustomizeModalOpen = true;
      }),

    closeCustomizeModal: () =>
      set((state) => {
        state.customizingItemId = null;
        state.isCustomizeModalOpen = false;
      }),

    updateItemCustomization: (itemId, customization) =>
      set((state) => {
        const item = state.orderItems.find((orderItem) => orderItem.id === itemId);
        if (!item) return;

        item.addons = customization.addons;
        item.removals = customization.removals;
        item.note = customization.note;
      }),

    resetOrder: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),

    clearSubmittedOrder: () =>
      set((state) => {
        const currentEmployeeId = state.employeeId;
        Object.assign(state, initialState);
        state.employeeId = currentEmployeeId;
      }),
  })),
);

export const getCustomizeItem = (state) =>
  state.orderItems.find((item) => item.id === state.customizingItemId) ?? null;

export default useStaffStore;
