export const isValidOpenAIKey = (key: string): boolean => {
  const pattern = /^sk-[A-Za-z0-9-]{48,}$/;
  return pattern.test(key);
};
