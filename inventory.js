import { loadInventory, saveInventory } from "./inventory-store.js";

const form = document.querySelector("#add-ingredient-form");
const message = document.querySelector("#inventory-message");
const list = document.querySelector("#inventory-list");
const emptyMessage = document.querySelector("#empty-inventory");

// 将代码里的食材编号转换成页面上显示的名称。
const ingredientNames = {
    egg: "鸡蛋",
    tomato: "番茄",
};

// 将代码里的单位转换成中文。
const unitNames = {
    pcs: "个",
};

// 读取库存，并重新显示列表。
// 之后组员完成删除功能，也可以调用这个函数更新页面。
export function renderInventory() {
    const records = loadInventory();

    // 清除旧列表，避免重复显示。
    list.replaceChildren();

    // 有记录时隐藏空库存提示。
    emptyMessage.hidden = records.length > 0;

    for (const record of records) {
        const item = document.createElement("li");
        const name = ingredientNames[record.ingredientId]
            ?? record.ingredientId;
        const unit = unitNames[record.unit] ?? record.unit;

        // 保存记录 id，后面编辑和删除时会用到。
        item.dataset.id = record.id;

        item.textContent =
            `${name} · ${record.quantity} ${unit} · 到期日期 ${record.expiryDate}`;

        list.appendChild(item);
    }
}

// 点击“新增食材”时执行。
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);

    const record = {
        id: crypto.randomUUID(),
        ingredientId: data.get("ingredientId"),
        quantity: Number(data.get("quantity")),
        unit: "pcs",
        expiryDate: data.get("expiryDate"),
    };

    try {
        const records = loadInventory();

        records.push(record);
        saveInventory(records);
    } catch {
        message.textContent = "保存失败，请检查浏览器中的库存数据和存储设置。";
        return;
    }

    form.reset();

    // 保存成功后，立即更新网页上的库存列表。
    renderInventory();
    message.textContent = "食材已保存。";
});

// 页面刚打开时，显示之前保存的库存。
try {
    renderInventory();
} catch {
    message.textContent = "库存读取失败，请检查浏览器中的库存数据和存储设置。";
}