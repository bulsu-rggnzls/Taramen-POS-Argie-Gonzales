export const getArrayFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;

  const sources = [
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.items,
  ];

  return sources.find(Array.isArray) ?? [];
};

export const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "active"].includes(normalized)) return true;
    if (["0", "false", "no", "inactive"].includes(normalized)) return false;
  }

  return fallback;
};
