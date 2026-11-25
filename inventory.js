import {
    loadInventory,
    saveInventory,
} from "./inventory-store.js";

import {
    getExpiryStatus,
    loadThreshold,
} from "./expiry.js";

const form = document.querySelector("#add-ingredient-form");
const message = document.querySelector("#inventory-message");
const list = document.querySelector("#inventory-list");
const emptyMessage = document.querySelector("#empty-inventory");

const saveButton = document.querySelector("#save-ingredient");
const cancelButton = document.querySelector("#cancel-edit");

const ingredientInput = form.elements.namedItem("ingredientId");
const quantityInput = form.elements.namedItem("quantity");
const expiryInput = form.elements.namedItem("expiryDate");

const ingredientNames = {
    egg: "鸡蛋",
    tomato: "番茄",
};

const unitNames = {
    pcs: "个",
};

const statusNames = {
    normal: "正常",
    expiring: "临期",
    expired: "已过期",
};

// null 表示新增模式，记录 id 表示正在编辑该批次。
let editingId = null;

// 退出编辑，恢复新增表单。
function resetForm() {
    editingId = null;
    form.reset();
    saveButton.textContent = "新增食材";
    cancelButton.hidden = true;
}

// 点击某条记录的编辑按钮时执行。
function startEditing(id) {
    try {
        // 重新读取，确保拿到当前保存的数据。
        const record = loadInventory().find(item => item.id === id);

        if (!record) {
            message.textContent = "这条记录已不存在，请刷新库存。";
            return;
        }

        // 兼容库存中已经存在、但下拉框还没有的食材。
        const optionExists = Array.from(ingredientInput.options)
            .some(option => option.value === record.ingredientId);

        if (!optionExists) {
            const name = ingredientNames[record.ingredientId]
                ?? record.ingredientId;

            ingredientInput.add(new Option(name, record.ingredientId));
        }

        editingId = record.id;
        ingredientInput.value = record.ingredientId;
        quantityInput.value = record.quantity;
        expiryInput.value = record.expiryDate;

        saveButton.textContent = "保存修改";
        cancelButton.hidden = false;
        message.textContent = "正在编辑选中的库存批次。";

        quantityInput.focus();
        form.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
        message.textContent = `无法打开编辑表单：${error.message}`;
    }
}

// 显示库存，供新增、编辑和之后的删除功能调用。
export function renderInventory() {
    const records = loadInventory();
    const thresholdDays = loadThreshold();

    list.replaceChildren();
    emptyMessage.hidden = records.length > 0;

    for (const record of records) {
        const item = document.createElement("li");
        item.dataset.id = record.id;

        const name = ingredientNames[record.ingredientId]
            ?? record.ingredientId;
        const unit = unitNames[record.unit] ?? record.unit;

        const status = getExpiryStatus(
            record.expiryDate,
            thresholdDays,
        );

        const text = document.createElement("span");
        text.textContent =
            `${name} · ${record.quantity} ${unit}` +
            ` · 到期日期 ${record.expiryDate}` +
            ` · ${statusNames[status]}`;

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "编辑";

        editButton.addEventListener("click", () => {
            startEditing(record.id);
        });

        item.append(text, editButton);
        list.appendChild(item);
    }
}

// 新增成功和编辑成功后都刷新列表。
function refreshAfterSave() {
    try {
        renderInventory();
    } catch (error) {
        message.textContent =
            `数据已保存，但列表刷新失败：${error.message}`;
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    const ingredientId = ingredientInput.value;
    const quantity = quantityInput.valueAsNumber;
    const expiryDate = expiryInput.value;

    if (!ingredientId ||
        !Number.isFinite(quantity) ||
        quantity < 0 ||
        !expiryDate) {
        message.textContent = "请填写食材、有效日期和非负数量。";
        return;
    }

    const isEditing = editingId !== null;

    try {
        // 使用王忆凝的函数，检查日期是否有效。
        getExpiryStatus(expiryDate, loadThreshold());

        // 保存前重新读取，保留其他批次的最新数据。
        const records = loadInventory();

        if (isEditing) {
            const index = records.findIndex(
                record => record.id === editingId,
            );

            if (index === -1) {
                message.textContent = "该记录已被删除，请取消编辑。";
                return;
            }

            // 保留原记录的 id、单位及其他已有字段。
            records[index] = {
                ...records[index],
                ingredientId,
                quantity,
                expiryDate,
            };
        } else {
            records.push({
                id: crypto.randomUUID(),
                ingredientId,
                quantity,
                unit: "pcs",
                expiryDate,
            });
        }

        saveInventory(records);
    } catch (error) {
        message.textContent = `保存失败：${error.message}`;
        return;
    }

    resetForm();
    message.textContent = isEditing
        ? "修改已保存。"
        : "食材已新增。";

    refreshAfterSave();
});

cancelButton.addEventListener("click", () => {
    resetForm();
    message.textContent = "已取消编辑。";
});

try {
    renderInventory();
} catch (error) {
    message.textContent = `库存读取失败：${error.message}`;
}