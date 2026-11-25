# 王忆凝第一周交付

使用组内主页面联调。根目录 expiry.js 已在 main 中，可直接复用。

## 接入团队页面

- UC-04：从 delete-inventory.js 导入 deleteInventoryRecord(id, { loadInventory, saveInventory, refreshInventory })。传入库存行原始 id 和王子玥的读写、刷新函数。取消不保存，成功才刷新。页面用 try/catch 展示读写错误。
- UC-05：expiry.js 导出 loadThreshold、saveThreshold、getExpiryStatus、getUsableStock。阈值键为 smartFridge.expiryThresholdDays。传入整数且范围 0–30，默认 3。到期日在当天时仍计为可用，并显示临期。输出状态为 normal、expiring、expired。保存后刷新库存和推荐。
- UC-06：公开接口 recommendRecipes(recipes, records, { checkStock, thresholdDays })。传入龚思童的 checkStock 或加一层字段适配。菜谱格式为 { id, name, ingredients: [{ ingredientId, unit, quantity }] }。可用库存为 [{ ingredientId, unit, quantity }]。checkStock 接收 ([recipe], usableStock)，返回数组，缺口行至少提供 ingredientId、unit、shortage。推荐和备餐都应调用同一实现。预览里的计算仅用于独立演示。



## 计划审查记录

计划覆盖第一周 UC-01 至 UC-08 的主流程，但原计划没有明确共用数据的返回结构、刷新函数名称和设置存储键。上面的接口可用于联调确认。第一周采用统一阈值，冷藏和冷冻分别设提醒属于后续方案。正式联调建议另测无菜可选、库存足够时不生成空单，以及单位不同不相减。不变的样例里，两道菜在 3 天时本就可能因 ID 顺序把番茄炒蛋排第一，因此验收也要查看临期种类数由 0 变为 1，并另测排序反转。
