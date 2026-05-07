import apiClient from "@/api/client";
import { getArrayFromPayload } from "./utils";

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

export const createEmployee = async (employeeData) => {
  const response = await apiClient.post("/employees", employeeData);
  return getArrayFromPayload(response.data);
};

export const getEmployeeById = async (id) => {
  const response = await apiClient.get(`/employees/${id}`);
  return getArrayFromPayload(response.data);
};

export const updateEmployee = async (id, employeeData) => {
  const response = await apiClient.put(`/employees/${id}`, employeeData);
  return getArrayFromPayload(response.data);
};

export const toggleEmployeeStatus = async (id, name) => {
  const response = await apiClient.patch(`/employees/${id}/toggle-status`, { name });
  return response.data;
};

export const deleteEmployee = async (id, name) => {
  const response = await apiClient.delete(`/employees/${id}`, { data: { name } });
  return response.data;
};

