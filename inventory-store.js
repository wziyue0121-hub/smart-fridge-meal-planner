const STORAGE_KEY = "smart-fridge.inventory";

export function loadInventory() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? [] : JSON.parse(saved);
}


export function saveInventory(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}