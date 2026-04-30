import apiClient from "@/api/client";
import { getArrayFromPayload } from "./utils";

export const menuItemQueryKeys = {
  menuItems: ["menu-items"],
  availableMenuItems: ["menu-items", "available"],
};

export const getMenuItems = async () => {
  const response = await apiClient.get("/menu-items");
  return getArrayFromPayload(response.data);
};

export const getAvailableMenuItems = async () => {
  const response = await apiClient.get("/menu-items/available");
  return getArrayFromPayload(response.data);
};

export const createMenuItem = async (payload) => {
  const isFormData = payload instanceof FormData;
  const response = await apiClient.post(
    "/menu-items",
    payload,
    isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined,
  );
  return response.data;
};

export const toggleMenuItemAvailability = async (id) => {
  const response = await apiClient.patch(
    `/menu-items/${id}/toggle-availability`,
  );
  return response.data;
};
