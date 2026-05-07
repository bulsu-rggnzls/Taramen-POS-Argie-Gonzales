import { isValid, parseISO } from "date-fns";

import { dateParser, priceParser } from "@/shared/helpers/parser";
import { takeOrderNumberSchema } from "@/shared/lib/zod/schema/take-order";

const NONE_DISCOUNT_VALUE = "none";

const getRawValue = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined) return source[key];
  }

  return "";
};

const normalizeList = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) =>
      typeof item === "object" && item !== null ? item.id : item,
    )
    .filter((item) => item != null && item !== "")
    .map(String);
};

export const toNumberIfPossible = (value) => {
  const parsedValue = takeOrderNumberSchema.safeParse(value);
  return parsedValue.success ? parsedValue.data : value;
};

export const toDiscountOption = (discount) => {
  const type = String(
    getRawValue(discount, ["type", "discount_type", "discount_type_name"]) ||
      discount.discountType?.name,
  ).toLowerCase();
  const value = Number(discount.value) || 0;
  const label = type.includes("percent")
    ? `${discount.name} (${value > 1 ? value : value * 100}%)`
    : `${discount.name} (-$${value.toFixed(2)})`;

  return {
    value: String(discount.id),
    label,
    type,
    amountValue: value,
    name: discount.name,
    category: String(
      discount.category ?? discount.discount_category ?? "",
    ).toLowerCase(),
    menuItemsId: normalizeList(discount.menu_items_id ?? discount.menuItems),
  };
};

export const calculateDiscountAmount = (subtotal, option) => {
  if (!option || option.value === NONE_DISCOUNT_VALUE) return 0;

  const value = Number(option.amountValue) || 0;
  const isPercentDiscount = option.type.includes("percent");
  const result = isPercentDiscount
    ? subtotal * (value > 1 ? value / 100 : value)
    : value;

  return Math.round(result * 100) / 100;
};

export const buildOrderPayload = ({
  dineType,
  discountValue,
  employeeId,
  orderItems,
  promoDiscountOptions,
  promoDiscountValue,
  regularDiscountOptions,
  tableNumber,
  noneDiscountOption,
}) => {
  const selectedRegularDiscount =
    regularDiscountOptions.find((option) => option.value === discountValue) ??
    noneDiscountOption;
  const selectedPromoDiscount =
    promoDiscountOptions.find((option) => option.value === promoDiscountValue) ??
    noneDiscountOption;

  return {
    employee_id: employeeId ? toNumberIfPossible(employeeId) : null,
    table_number: dineType === "takeout" ? "takeout" : tableNumber || null,
    items: orderItems.map((item) => {
      const menuItemId = String(item.id);
      const appliesPromoDiscount =
        selectedPromoDiscount.value !== NONE_DISCOUNT_VALUE &&
        selectedPromoDiscount.menuItemsId.includes(menuItemId);
      const appliesRegularDiscount =
        selectedRegularDiscount.value !== NONE_DISCOUNT_VALUE &&
        selectedRegularDiscount.menuItemsId.includes(menuItemId);
      const selectedItemDiscount = appliesPromoDiscount
        ? selectedPromoDiscount
        : appliesRegularDiscount
          ? selectedRegularDiscount
          : null;

      return {
        menu_item_id: toNumberIfPossible(menuItemId),
        quantity: item.qty,
        ...(selectedItemDiscount && {
          discount_id: toNumberIfPossible(selectedItemDiscount.value),
        }),
      };
    }),
  };
};

export const formatCurrency = (value) => priceParser(Number(value) || 0);

export const formatOrderDateTime = (value, format = "PPp") => {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? parseISO(value)
        : new Date(value);

  if (!isValid(date)) return "---";

  return dateParser(date.toISOString(), format);
};
