import { useCallback } from "react";

export const useLogout = () => {
  return useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login"; 
  }, []);
};
