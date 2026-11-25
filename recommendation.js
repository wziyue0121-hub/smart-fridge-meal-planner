import { getExpiryStatus, getUsableStock, localToday } from './expiry.js';

export async function loadRecipes(url = new URL('./recipes.json', import.meta.url)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('菜谱读取失败：' + response.status);
  return response.json();
}

export async function recommendRecipes(recipes, records, { checkStock, thresholdDays, today = localToday() }) {
  const usableStock = getUsableStock(records, today);
  const key = ({ ingredientId, unit }) => JSON.stringify([ingredientId, unit]);
  const expiring = new Set(records.filter(r => r.quantity > 0 &&
    getExpiryStatus(r.expiryDate, thresholdDays, today) === 'expiring').map(key));

  const recommendations = await Promise.all(recipes.map(async recipe => {
    const stock = await checkStock([recipe], usableStock);
    const missing = stock.filter(row => row.shortage > 0);
    return {
      recipe, missing,
      expiringCount: new Set(recipe.ingredients.filter(r => expiring.has(key(r))).map(r => r.ingredientId)).size,
      missingCount: new Set(missing.map(r => r.ingredientId)).size
    };
  }));
  return recommendations.sort((a, b) => b.expiringCount - a.expiringCount ||
    a.missingCount - b.missingCount ||
    (a.recipe.id < b.recipe.id ? -1 : a.recipe.id > b.recipe.id ? 1 : 0));
}
