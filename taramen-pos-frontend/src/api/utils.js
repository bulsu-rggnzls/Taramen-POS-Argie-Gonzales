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
