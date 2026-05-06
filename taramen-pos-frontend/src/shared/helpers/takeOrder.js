import { isValid, parseISO } from "date-fns";

import { dateParser, priceParser } from "@/shared/helpers/parser";
import { takeOrderNumberSchema } from "@/shared/lib/zod/schema/take-order";

const NONE_DISCOUNT_VALUE = "none";

const getDiscountType = (discount) => {
  const resolvedType =
    discount.type ??
    discount.discount_type ??
    discount.discountType?.name ??
    discount.discount_type_name ??
    "";

  return String(resolvedType).toLowerCase();
};

const getDiscountCategory = (discount) =>
  String(discount.category ?? discount.discount_category ?? "").toLowerCase();

const getDiscountMenuItemIds = (discount) => {
  const menuItems = discount.menu_items_id ?? discount.menuItems ?? [];

  if (!Array.isArray(menuItems)) return [];

  return menuItems
    .map((menuItem) =>
      typeof menuItem === "object" && menuItem !== null ? menuItem.id : menuItem,
    )
    .filter((menuItemId) => menuItemId != null && menuItemId !== "");
};

export const getDiscountLabel = (discount) => {
  const value = Number(discount.value) || 0;
  const discountType = getDiscountType(discount);

  if (discountType.includes("percent")) {
    const percentValue = value > 1 ? value : value * 100;
    return `${discount.name} (${percentValue}%)`;
  }

  return `${discount.name} (-$${value.toFixed(2)})`;
};

export const toDiscountOption = (discount) => ({
  value: String(discount.id),
  label: getDiscountLabel(discount),
  type: getDiscountType(discount),
  amountValue: Number(discount.value) || 0,
  name: discount.name,
  category: getDiscountCategory(discount),
  menuItemsId: getDiscountMenuItemIds(discount),
});

export const calculateDiscountAmount = (subtotal, option) => {
  if (!option || option.value === NONE_DISCOUNT_VALUE) return 0;

  const numericValue = Number(option.amountValue) || 0;

  if (option.type.includes("percent")) {
    const rate = numericValue > 1 ? numericValue / 100 : numericValue;
    const result = subtotal * rate;
    return Math.round(result * 100) / 100; // Rounds to 2 decimal places
  }

  const result = numericValue;
  return Math.round(result * 100) / 100; // Rounds to 2 decimal places
};

export const toNumberIfPossible = (value) => {
  const parsedValue = takeOrderNumberSchema.safeParse(value);
  return parsedValue.success ? parsedValue.data : value;
};

const toOrderDate = (value) => {
  if (!value) return null;

  const parsedDate =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? parseISO(value)
        : new Date(value);

  return isValid(parsedDate) ? parsedDate : null;
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
      const menuItemId = toNumberIfPossible(item.id);
      const appliesPromoDiscount =
        selectedPromoDiscount.value !== NONE_DISCOUNT_VALUE &&
        selectedPromoDiscount.menuItemsId.includes(String(menuItemId));
      const appliesRegularDiscount =
        selectedRegularDiscount.value !== NONE_DISCOUNT_VALUE &&
        selectedRegularDiscount.menuItemsId.includes(String(menuItemId));
      const selectedItemDiscount = appliesPromoDiscount
        ? selectedPromoDiscount
        : appliesRegularDiscount
          ? selectedRegularDiscount
          : noneDiscountOption;
      const itemPayload = {
        menu_item_id: menuItemId,
        quantity: item.qty,
      };

      if (selectedItemDiscount.value !== NONE_DISCOUNT_VALUE) {
        itemPayload.discount_id = toNumberIfPossible(selectedItemDiscount.value);
      }

      return itemPayload;
    }),
  };
};

export const formatCurrency = (value) =>
  priceParser(Number(value) || 0);

export const formatOrderDateTime = (value, format = "PPp") => {
  const parsedDate = toOrderDate(value);
  if (!parsedDate) return "---";

  return dateParser(parsedDate.toISOString(), format);
};
