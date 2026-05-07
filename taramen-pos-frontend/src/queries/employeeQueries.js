import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getEmployees, 
  getAllEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  toggleEmployeeStatus,
  employeeQueryKeys 
} from "@/api/employeesApi";

export const useEmployees = () => {
  return useQuery({
    queryKey: employeeQueryKeys.employees,
    queryFn: getEmployees,
  });
};

export const useAllEmployees = () => {
  return useQuery({
    queryKey: employeeQueryKeys.allEmployees,
    queryFn: getAllEmployees,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.allEmployees });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.allEmployees });
    },
  });
};

export const useToggleEmployeeStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }) => toggleEmployeeStatus(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.allEmployees });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }) => deleteEmployee(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.allEmployees });
    },
  });
};
