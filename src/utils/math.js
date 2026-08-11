export const clamp = (val, min, max) =>
  Math.min(max, Math.max(min, val));

export const calcProgress = (current, total, min = 0, max = 100) => {
  const isInvalid =
    !total ||
    total <= 0 ||
    !Number.isFinite(total) ||
    !Number.isFinite(current);
  if (isInvalid) return min;
  const progress = (current / total) * (max - min) + min;
  return clamp(progress, min, max);
};
