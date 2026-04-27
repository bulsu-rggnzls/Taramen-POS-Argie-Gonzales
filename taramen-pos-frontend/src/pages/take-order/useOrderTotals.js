import { useMemo } from "react";

import { calculateDiscountAmount } from "./utils";

export default function useOrderTotals({
  orderItems,
  discountValue,
  promoDiscountValue,
  regularDiscountOptions,
  promoDiscountOptions,
  noneDiscountOption,
}) {
  return useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      const addonTotal =
        item.addons?.reduce((addonSum, addon) => addonSum + addon.price, 0) ?? 0;
      return sum + (item.price + addonTotal) * item.qty;
    }, 0);

    const selectedDiscount =
      regularDiscountOptions.find((option) => option.value === discountValue) ??
      noneDiscountOption;
    const selectedPromo =
      promoDiscountOptions.find((option) => option.value === promoDiscountValue) ??
      noneDiscountOption;

    const discountAmount = calculateDiscountAmount(subtotal, selectedDiscount);
    const promoAmount = calculateDiscountAmount(subtotal, selectedPromo);
    const taxable = Math.max(subtotal - discountAmount - promoAmount, 0);
    const taxAmount = taxable * 0.1;
    const total = taxable + taxAmount;

    return { subtotal, discountAmount, promoAmount, taxAmount, total };
  }, [
    orderItems,
    discountValue,
    promoDiscountValue,
    regularDiscountOptions,
    promoDiscountOptions,
    noneDiscountOption,
  ]);
}
