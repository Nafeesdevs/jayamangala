import Product from "../model/productModel.js";

// Reduce stock for all items. If any item fails, roll back the ones already reduced.
export const reduceStock = async (items) => {
    const done = [];
    for (const item of items) {
        const updated = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
        );
        if (!updated) {
            await restoreStock(done);
            return { ok: false, name: item.name };
        }
        done.push(item);
    }
    return { ok: true };
};

export const restoreStock = async (items) => {
    for (const item of items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
};

// Cancel an order, restore stock and push a history entry
export const cancelOrderInternal = async (order, note, updatedBy) => {
    if (order.status === "Cancelled") return order;
    await restoreStock(order.items);
    order.status = "Cancelled";
    order.cancelReason = note;
    order.statusHistory.push({ status: "Cancelled", note, updatedBy });
    await order.save();
    return order;
};
