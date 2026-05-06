import { z } from "zod";

import { stringNumberRequired, stringOptional, trimmedString } from "../helpers.js";

export const TAKE_ORDER_DINE_TYPES = ["dine-in", "takeout"];

export const takeOrderNumberSchema = stringNumberRequired("Value");

export const takeOrderDineTypeSchema = z.enum(TAKE_ORDER_DINE_TYPES);

export const takeOrderDiscountValueSchema = z.union([
   z.literal("none"),
   takeOrderNumberSchema,
]);

export const takeOrderAddonSchema = z.object({
   id: trimmedString("Add-on ID"),
   label: trimmedString("Add-on label"),
   price: takeOrderNumberSchema,
});

export const takeOrderRemovalSchema = z.object({
   id: trimmedString("Removal ID"),
   label: trimmedString("Removal label"),
});

export const takeOrderItemSchema = z.object({
   id: takeOrderNumberSchema,
   name: trimmedString("Item name"),
   details: stringOptional(),
   price: takeOrderNumberSchema,
   qty: stringNumberRequired("Quantity"),
   accent: stringOptional(),
   addons: z.array(takeOrderAddonSchema),
   removals: z.array(takeOrderRemovalSchema),
   note: stringOptional(),
});

export const takeOrderStateSchema = z.object({
   tableNumber: z.string(),
   employeeId: z.string(),
   discountValue: takeOrderDiscountValueSchema,
   promoDiscountValue: takeOrderDiscountValueSchema,
   dineType: takeOrderDineTypeSchema,
   orderItems: z.array(takeOrderItemSchema),
   searchTerm: z.string(),
   activeCategory: z.string(),
   isCustomizeModalOpen: z.boolean(),
   customizingItemId: z.union([z.null(), takeOrderNumberSchema]),
});

export const takeOrderPayloadItemSchema = z.object({
   menu_item_id: takeOrderNumberSchema,
   quantity: stringNumberRequired("Quantity"),
   discount_id: takeOrderNumberSchema.optional(),
});

export const takeOrderPayloadSchema = z.object({
   employee_id: takeOrderNumberSchema,
   table_number: z.string().min(1, "Table number is required."),
   items: z
      .array(takeOrderPayloadItemSchema)
      .min(1, "Add at least one item before submitting the order."),
});

export const takeOrderDefaultValues = {
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
