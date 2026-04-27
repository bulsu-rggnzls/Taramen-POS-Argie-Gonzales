import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  createMenuItem,
  createOrder,
  deleteCategory,
  getAvailableMenuItems,
  getCategories,
  getDiscounts,
  getEmployees,
  getOrderReceipt,
  getOrders,
  getOrderStats,
  getMenuItems,
  posQueryKeys,
  toggleMenuItemAvailability,
  updateCategory,
  updateOrderStatus,
} from "@/shared/api/posApi";

export const useEmployees = () =>
  useQuery({ queryKey: posQueryKeys.employees, queryFn: getEmployees });

export const useCategories = () =>
  useQuery({ queryKey: posQueryKeys.categories, queryFn: getCategories });

export const useMenuItems = () =>
  useQuery({ queryKey: posQueryKeys.menuItems, queryFn: getMenuItems });

export const useAvailableMenuItems = () =>
  useQuery({
    queryKey: posQueryKeys.availableMenuItems,
    queryFn: getAvailableMenuItems,
  });

export const useDiscounts = (options = {}) =>
  useQuery({
    queryKey: posQueryKeys.discounts,
    queryFn: getDiscounts,
    ...options,
  });

export const useOrders = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...posQueryKeys.orders, params],
    queryFn: () => getOrders(params),
    ...options,
  });

export const useOrderStats = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...posQueryKeys.orderStats, params],
    queryFn: () => getOrderStats(params),
    ...options,
  });

export const useOrderReceipt = (orderId, options = {}) =>
  useQuery({
    queryKey: [...posQueryKeys.orders, orderId, "receipt"],
    queryFn: () => getOrderReceipt(orderId),
    enabled: Boolean(orderId) && (options.enabled ?? true),
    ...options,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: posQueryKeys.categories }),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: posQueryKeys.categories }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: posQueryKeys.categories }),
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posQueryKeys.menuItems });
      queryClient.invalidateQueries({ queryKey: posQueryKeys.availableMenuItems });
    },
  });
};

export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleMenuItemAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posQueryKeys.menuItems });
      queryClient.invalidateQueries({ queryKey: posQueryKeys.availableMenuItems });
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posQueryKeys.orders });
      queryClient.invalidateQueries({ queryKey: posQueryKeys.orderStats });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posQueryKeys.orders });
      queryClient.invalidateQueries({ queryKey: posQueryKeys.orderStats });
    },
  });
};
