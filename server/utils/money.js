export const toCents = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new TypeError('Money value must be a finite number.');
  }
  return Math.round((amount + Number.EPSILON) * 100);
};

export const fromCents = (cents) => Number((Number(cents || 0) / 100).toFixed(2));

export const percentageOfCents = (cents, percentage) => {
  const safePercentage = Math.min(100, Math.max(0, Number(percentage) || 0));
  return Math.round((cents * safePercentage) / 100);
};

