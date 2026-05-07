import apiClient from "@/api/client";
import { getArrayFromPayload, normalizeBoolean } from "./apiPayloadUtils";

export const discountQueryKeys = {
  discounts: ["discounts"],
  activeDiscounts: ["discounts", "active"],
};

export const getDiscounts = async () => {
  const response = await apiClient.get("/discounts");
  return getArrayFromPayload(response.data);
};

export const getActiveDiscounts = async () => {
  const response = await apiClient.get("/discounts/getActive");
  return getArrayFromPayload(response.data).filter((discount) =>
    normalizeBoolean(discount.active, true),
  );
};
