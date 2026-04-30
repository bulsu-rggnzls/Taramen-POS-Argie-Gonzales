import { DATATABLE_SORT_KEYS } from "@/shared/constants/options";
import { create } from "zustand";

export const useDatatableStore = create((set, get) => ({
   currentPage: 1,
   pageSize: 10,

   searchTerm: "",
   activeFilters: {},
   dateRange: {
      from: null,
      to: null,
   },

   sortField: null,
   sortOrder: null,

   selectedRows: [],
   expandedRows: [],

   setCurrentPage: (page) => set({ currentPage: page }),
   setPageSize: (size) =>
      set({
         pageSize: size,
         currentPage: 1,
      }),

   setSearchTerm: (term) =>
      set({
         searchTerm: term,
         currentPage: 1,
      }),

   setFilter: (filterKey, value) =>
      set((state) => ({
         activeFilters: {
            ...state.activeFilters,
            [filterKey]: value,
         },
         currentPage: 1,
      })),

   setFilters: (filtersObject) =>
      set((state) => ({
         activeFilters: {
            ...state.activeFilters,
            ...filtersObject,
         },
         currentPage: 1,
      })),

   setDateRange: (from, to) =>
      set({
         dateRange: { from, to },
         currentPage: 1,
      }),

   clearFilter: (filterKey) =>
      set((state) => {
         const newFilters = { ...state.activeFilters };
         delete newFilters[filterKey];
         return {
            activeFilters: newFilters,
            currentPage: 1,
         };
      }),

   clearFilters: () =>
      set({
         activeFilters: {},
         searchTerm: "",
         dateRange: {
            from: null,
            to: null,
         },
         currentPage: 1,
      }),

   setSort: (field, order) =>
      set({
         sortField: field,
         sortOrder: order,
         currentPage: 1,
      }),

   toggleSort: (field) =>
      set((state) => {
         if (state.sortField === field) {
            if (state.sortOrder === DATATABLE_SORT_KEYS.ASC) {
               return { sortOrder: DATATABLE_SORT_KEYS.DESC };
            }

            if (state.sortOrder === DATATABLE_SORT_KEYS.DESC) {
               return { sortField: null, sortOrder: null };
            }
         }

         return {
            sortField: field,
            sortOrder: DATATABLE_SORT_KEYS.ASC,
            currentPage: 1,
         };
      }),

   clearSort: () =>
      set({
         sortField: null,
         sortOrder: null,
      }),

   setSelectedRows: (rows) => set({ selectedRows: rows }),
   selectRow: (id) =>
      set((state) => ({
         selectedRows: state.selectedRows.includes(id)
            ? state.selectedRows
            : [...state.selectedRows, id],
      })),
   deselectRow: (id) =>
      set((state) => ({
         selectedRows: state.selectedRows.filter((rowId) => rowId !== id),
      })),
   selectAll: (ids) => set({ selectedRows: ids }),
   clearSelection: () => set({ selectedRows: [] }),

   setExpandedRows: (rows) => set({ expandedRows: rows }),
   toggleRowExpansion: (id) =>
      set((state) => ({
         expandedRows: state.expandedRows.includes(id)
            ? state.expandedRows.filter((rowId) => rowId !== id)
            : [...state.expandedRows, id],
      })),
   expandRow: (id) =>
      set((state) => ({
         expandedRows: state.expandedRows.includes(id)
            ? state.expandedRows
            : [...state.expandedRows, id],
      })),
   collapseRow: (id) =>
      set((state) => ({
         expandedRows: state.expandedRows.filter((rowId) => rowId !== id),
      })),
   collapseAll: () => set({ expandedRows: [] }),

   hasActiveFilters: () => {
      const { searchTerm, activeFilters, dateRange } = get();

      return (
         searchTerm !== "" ||
         Object.keys(activeFilters).some(
            (key) => activeFilters[key] !== null && activeFilters[key] !== "all",
         ) ||
         dateRange.from !== null ||
         dateRange.to !== null
      );
   },

   getActiveFiltersCount: () => {
      const { searchTerm, activeFilters, dateRange } = get();
      let count = 0;

      if (searchTerm) count++;
      if (dateRange.from || dateRange.to) count++;

      count += Object.keys(activeFilters).filter(
         (key) =>
            activeFilters[key] !== null &&
            activeFilters[key] !== "all" &&
            activeFilters[key] !== "",
      ).length;

      return count;
   },

   resetState: () =>
      set({
         currentPage: 1,
         pageSize: 10,
         searchTerm: "",
         activeFilters: {},
         dateRange: {
            from: null,
            to: null,
         },
         selectedRows: [],
         expandedRows: [],
         sortField: null,
         sortOrder: null,
      }),

   resetTableState: () => get().resetState(),
}));

export default useDatatableStore;
