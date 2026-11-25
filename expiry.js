export const thresholdKey = 'smartFridge.expiryThresholdDays';
export const defaultThreshold = 3;

function validateThreshold(days) {
  if (!Number.isInteger(days) || days < 0 || days > 30)
    throw new RangeError('临期阈值必须是 0–30 的整数');
}

export function loadThreshold(storage = localStorage) {
  const raw = storage.getItem(thresholdKey);
  const days = raw === null ? defaultThreshold : Number(raw);
  return /^\d+$/.test(raw ?? '') && Number.isInteger(days) && days <= 30
    ? days : defaultThreshold;
}

export function saveThreshold(days, storage = localStorage) {
  validateThreshold(days);
  storage.setItem(thresholdKey, String(days));
}

function dayNumber(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new RangeError('到期日期必须为 YYYY-MM-DD');
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value)
    throw new RangeError('无效日期');
  return +date / 86400000;
}

export function localToday(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('-');
}

export function getExpiryStatus(expiryDate, thresholdDays = defaultThreshold, today = localToday()) {
  validateThreshold(thresholdDays);
  const remaining = dayNumber(expiryDate) - dayNumber(today);
  return remaining < 0 ? 'expired' : remaining <= thresholdDays ? 'expiring' : 'normal';
}

export function getUsableStock(records, today = localToday()) {
  const totals = new Map();
  for (const { ingredientId, unit, quantity, expiryDate } of records) {
    if (!Number.isFinite(quantity) || quantity <= 0 ||
        getExpiryStatus(expiryDate, 0, today) === 'expired') continue;
    const key = JSON.stringify([ingredientId, unit]);
    const previous = totals.get(key)?.quantity ?? 0;
    totals.set(key, { ingredientId, unit, quantity: previous + quantity });
  }
  return [...totals.values()];
}
