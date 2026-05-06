import { useMutation, useQuery } from "@tanstack/react-query";

import { getCategories, categoryQueryKeys } from "@/api/categoriesApi";
import {
  discountQueryKeys,
  getActiveDiscounts,
} from "@/api/discountsApi";
import { employeeQueryKeys, getEmployees } from "@/api/employeesApi";
import {
  getAvailableMenuItems,
  menuItemQueryKeys,
} from "@/api/menuItemsApi";
import { createOrder, orderQueryKeys } from "@/api/ordersApi";
import {
  ALL_CATEGORY_TAB,
  CATEGORY_ICON_OPTIONS,
  NONE_DISCOUNT_OPTION,
} from "@/pages/take-order/take-order-config";
import { normalizeBoolean } from "@/api/apiPayloadUtils";
import { toDiscountOption } from "@/shared/helpers/takeOrder";
import { queryClient } from "@/shared/lib/query-client";

export const TAKE_ORDER_KEYS = {
  employees: employeeQueryKeys.employees,
  categories: categoryQueryKeys.categories,
  availableMenuItems: menuItemQueryKeys.availableMenuItems,
  activeDiscounts: discountQueryKeys.activeDiscounts,
  orders: orderQueryKeys.orders,
  orderStats: orderQueryKeys.orderStats,
};

const toCategoryTabs = (categories = []) => [
  ALL_CATEGORY_TAB,
  ...categories.map((category, index) => ({
    id: String(category.id),
    label: category.name,
    icon:
      CATEGORY_ICON_OPTIONS[index % CATEGORY_ICON_OPTIONS.length] ??
      ALL_CATEGORY_TAB.icon,
  })),
];

const toEmployeeOptions = (employees = []) =>
  employees
    .filter((employee) => employee?.id != null)
    .filter((employee) => normalizeBoolean(employee.active, true))
    .map((employee) => ({
      value: String(employee.id),
      label: employee.name?.trim() || `Employee #${employee.id}`,
    }));

const toDiscountGroups = (discounts = []) => {
  const discountOptions = discounts.map(toDiscountOption);
  const regularOptions = discountOptions.filter(
    (option) => !option.category.includes("promo"),
  );
  const promoOptions = discountOptions.filter((option) =>
    option.category.includes("promo"),
  );

  return {
    discountOptions,
    regularDiscountOptions: [
      NONE_DISCOUNT_OPTION,
      ...(regularOptions.length > 0 ? regularOptions : discountOptions),
    ],
    promoDiscountOptions: [
      NONE_DISCOUNT_OPTION,
      ...(promoOptions.length > 0 ? promoOptions : discountOptions),
    ],
  };
};

export const useEmployeesQuery = (options = {}) => {
  return useQuery({
    queryKey: TAKE_ORDER_KEYS.employees,
    queryFn: getEmployees,
    ...options,
  });
};

export const useEmployeeOptionsQuery = (options = {}) => {
  return useEmployeesQuery({
    select: toEmployeeOptions,
    ...options,
  });
};

export const useCategoriesQuery = (options = {}) => {
  return useQuery({
    queryKey: TAKE_ORDER_KEYS.categories,
    queryFn: getCategories,
    ...options,
  });
};

export const useCategoryTabsQuery = (options = {}) => {
  return useCategoriesQuery({
    select: toCategoryTabs,
    ...options,
  });
};

export const useAvailableMenuItemsQuery = (options = {}) => {
  return useQuery({
    queryKey: TAKE_ORDER_KEYS.availableMenuItems,
    queryFn: getAvailableMenuItems,
    ...options,
  });
};

export const useActiveDiscountsQuery = (options = {}) => {
  return useQuery({
    queryKey: TAKE_ORDER_KEYS.activeDiscounts,
    queryFn: getActiveDiscounts,
    ...options,
  });
};

export const useDiscountGroupsQuery = (options = {}) => {
  return useActiveDiscountsQuery({
    select: toDiscountGroups,
    ...options,
  });
};

export const useCreateOrderMutation = (options = {}) => {
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAKE_ORDER_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: TAKE_ORDER_KEYS.orderStats });
    },
    ...options,
  });
};
