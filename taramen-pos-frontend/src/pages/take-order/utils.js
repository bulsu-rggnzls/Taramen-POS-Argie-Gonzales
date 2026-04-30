export const getDiscountLabel = (discount) => {
  const value = Number(discount.value) || 0;

  if (String(discount.type).includes("percent")) {
    const percentValue = value > 1 ? value : value * 100;
    return `${discount.name} (${percentValue}%)`;
  }

  return `${discount.name} (-$${value.toFixed(2)})`;
};

export const toDiscountOption = (discount) => ({
  value: String(discount.id),
  label: getDiscountLabel(discount),
  type: String(discount.type).toLowerCase(),
  amountValue: Number(discount.value) || 0,
  name: discount.name,
  category: String(discount.category ?? "").toLowerCase(),
});

export const calculateDiscountAmount = (subtotal, option) => {
  if (!option || option.value === "none") return 0;

  const numericValue = Number(option.amountValue) || 0;

  if (option.type.includes("percent")) {
    const rate = numericValue > 1 ? numericValue / 100 : numericValue;
    return subtotal * rate;
  }

  return numericValue;
};

export const toNumberIfPossible = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
};

export const buildOrderPayload = ({
  dineType,
  discountValue,
  employeeId,
  orderItems,
  regularDiscountOptions,
  tableNumber,
  noneDiscountOption,
}) => {
  const selectedDiscount =
    regularDiscountOptions.find((option) => option.value === discountValue) ??
    noneDiscountOption;

  return {
    employee_id: employeeId ? toNumberIfPossible(employeeId) : null,
    table_number: dineType === "takeout" ? "takeout" : tableNumber || null,
    items: orderItems.map((item) => ({
      menu_item_id: toNumberIfPossible(item.id),
      quantity: item.qty,
      discount_id:
        selectedDiscount.value === "none"
          ? null
          : toNumberIfPossible(selectedDiscount.value),
    })),
  };
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
