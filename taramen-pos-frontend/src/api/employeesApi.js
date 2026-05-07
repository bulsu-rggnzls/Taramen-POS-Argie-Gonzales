import apiClient from "@/api/client";
import { getArrayFromPayload } from "./apiPayloadUtils";

export const employeeQueryKeys = {
  employees: ["employees"],
  allEmployees: ["employees", "all"],
};

export const getEmployees = async () => {
  const response = await apiClient.get("/employees");
  return getArrayFromPayload(response.data);
};

export const getAllEmployees = async () => {
  const response = await apiClient.get("/employees/all");
  return getArrayFromPayload(response.data);
};
