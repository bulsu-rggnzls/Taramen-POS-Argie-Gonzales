export const extractErrorMessage = (error, fallback) => {
  if (error?.response?.status === 503) {
    return "API service is temporarily unavailable (503). Please retry in a few moments.";
  }

  if (!error?.response) {
    return "Cannot reach API server. Check backend status and VITE_API_BASE_URL.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
