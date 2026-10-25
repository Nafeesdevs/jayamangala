import Quotation from "../model/quotationModel.js";
import Lead from "../model/leadModel.js";

// Helper: Generate quotation number like QTN-YYYYMMDD-XXXX
const generateQuotationNumber = () => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `QTN-${dateStr}-${rand}`;
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Create a quotation for a lead
// POST /quotation
// ─────────────────────────────────────────────────────────────
export const createQuotation = async (req, res) => {
    try {
        const { leadId, items, taxRate = 0, validUntil, paymentTerms, deliveryTerms, notes } = req.body;

        if (!leadId) {
            return res.status(400).json({ success: false, message: "Lead ID is required" });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "At least one product item is required" });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        // Server-side calculation of totals
        let calculatedSubtotal = 0;
        const processedItems = items.map(item => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.unitPrice) || 0;
            const lineTotal = Math.round(qty * price * 100) / 100;
            calculatedSubtotal += lineTotal;
            return {
                productId: item.productId || null,
                name: String(item.name || "").trim() || "Item",
                quantity: qty,
                unit: String(item.unit || "Litre").trim(),
                unitPrice: price,
                total: lineTotal
            };
        });

        const rate = Math.max(0, Number(taxRate) || 0);
        const calculatedTax = Math.round((calculatedSubtotal * (rate / 100)) * 100) / 100;
        const grandTotal = Math.round((calculatedSubtotal + calculatedTax) * 100) / 100;

        const quotation = await Quotation.create({
            leadId,
            quotationNumber: generateQuotationNumber(),
            items: processedItems,
            subtotal: calculatedSubtotal,
            taxRate: rate,
            taxAmount: calculatedTax,
            grandTotal,
            validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            paymentTerms: paymentTerms || undefined,
            deliveryTerms: deliveryTerms || undefined,
            notes: notes || "",
            status: "Sent",
            createdBy: req.user?._id || null
        });

        // Update Lead status and timeline
        lead.status = "Quote Sent";
        lead.timeline.push({
            action: "Quotation Generated",
            details: `${quotation.quotationNumber} for ₹${grandTotal.toLocaleString("en-IN")}`,
            performedBy: req.user?._id || null,
            performedByName: req.user?.name || "Admin"
        });
        await lead.save();

        res.status(201).json({
            success: true,
            message: "Quotation created and lead updated to Quote Sent",
            data: quotation
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Get all quotations for a lead
// GET /quotations/lead/:leadId
// ─────────────────────────────────────────────────────────────
export const getLeadQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find({ leadId: req.params.leadId })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name");
        res.status(200).json({ success: true, count: quotations.length, data: quotations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Update quotation status
// PUT /quotation/status/:id
// ─────────────────────────────────────────────────────────────
export const updateQuotationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
        }

        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!quotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }

        // If accepted or rejected, log on lead timeline
        if (quotation.leadId) {
            const lead = await Lead.findById(quotation.leadId);
            if (lead) {
                if (status === "Accepted") {
                    lead.status = "Won";
                }
                lead.timeline.push({
                    action: `Quotation ${status}`,
                    details: `${quotation.quotationNumber} marked as ${status}`,
                    performedBy: req.user?._id || null,
                    performedByName: req.user?.name || "Admin"
                });
                await lead.save();
            }
        }

        res.status(200).json({ success: true, message: `Quotation updated to ${status}`, data: quotation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Get single quotation
// GET /quotation/:id
// ─────────────────────────────────────────────────────────────
export const getSingleQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate("leadId")
            .populate("createdBy", "name");
        if (!quotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }
        res.status(200).json({ success: true, data: quotation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

