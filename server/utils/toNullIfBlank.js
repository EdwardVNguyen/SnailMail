// Converts empty strings or whitespace-only strings to null
export const toNullIfBlank = (value) => {
  if (!value || value.trim() === "") return null;
  return value;
};
