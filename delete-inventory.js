export async function deleteInventoryRecord(id, {
  loadInventory, saveInventory, refreshInventory,
  confirmDelete = () => globalThis.confirm('确定删除这条库存记录吗？')
}) {
  const selected = (await loadInventory()).find(record => record.id === id);
  if (!selected) return { status: 'not-found' };
  if (!await confirmDelete(selected)) return { status: 'cancelled' };
  const current = await loadInventory();
  const index = current.findIndex(record => record.id === id);
  if (index === -1) return { status: 'not-found' };
  const next = current.slice();
  next.splice(index, 1);
  await saveInventory(next);
  await refreshInventory();
  return { status: 'deleted' };
}
