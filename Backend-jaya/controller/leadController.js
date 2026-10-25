import Lead from "../model/leadModel.js";

// ─────────────────────────────────────────────────────────────
// PUBLIC — Submit a new lead (wholesale enquiry, homepage enquiry, contact form)
// POST /lead
// body: { name, company?, phone, email?, productInterest[], estimatedQuantity?, message?, source? }
// ─────────────────────────────────────────────────────────────
export const createLead = async (req, res) => {
    try {
        const { name, company, phone, email, productInterest, estimatedQuantity, message, source } = req.body;

        // ── Required field validation ──────────────────────────────
        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }
        if (!phone || !/^\d{10}$/.test(String(phone).replace(/[\s\-()]/g, ""))) {
            return res.status(400).json({ success: false, message: "A valid 10-digit phone number is required" });
        }

        // ── Input size limits (prevent abuse) ─────────────────────
        if (String(name).trim().length > 100) {
            return res.status(400).json({ success: false, message: "Name must be under 100 characters" });
        }
        if (company && String(company).trim().length > 150) {
            return res.status(400).json({ success: false, message: "Company name must be under 150 characters" });
        }
        if (message && String(message).trim().length > 2000) {
            return res.status(400).json({ success: false, message: "Message must be under 2000 characters" });
        }
        if (email && String(email).trim().length > 200) {
            return res.status(400).json({ success: false, message: "Email must be under 200 characters" });
        }

        // ── Sanitize and safe-strip basic HTML tags ────────────────
        const strip = (v) => v ? String(v).replace(/<[^>]*>/g, "").trim() : "";

        // ── Duplicate detection — same phone submitted within 5 min ─
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existing = await Lead.findOne({
            phone: String(phone).replace(/[\s\-()]/g, ""),
            createdAt: { $gte: fiveMinAgo }
        });
        if (existing) {
            return res.status(429).json({
                success: false,
                message: "Your enquiry was already submitted. We will contact you shortly."
            });
        }

        const cleanPhone = String(phone).replace(/[\s\-()]/g, "");

        const lead = await Lead.create({
            name: strip(name).slice(0, 100),
            company: strip(company).slice(0, 150),
            phone: cleanPhone,
            email: strip(email).slice(0, 200),
            productInterest: Array.isArray(productInterest)
                ? productInterest.slice(0, 20).map((x) => strip(x).slice(0, 100))
                : [],
            estimatedQuantity: strip(estimatedQuantity).slice(0, 100),
            message: strip(message).slice(0, 2000),
            source: ["wholesale_page", "homepage_enquiry", "contact_form", "whatsapp"].includes(source)
                ? source
                : "homepage_enquiry",
            timeline: [{
                action: "Enquiry Submitted",
                details: `Source: ${source || "homepage_enquiry"}`,
                performedByName: "Customer"
            }]
        });

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully. We will contact you shortly.",
            data: { id: lead._id }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Get all leads (with optional filters)
// GET /leads?status=New&search=&followUpFilter=today|overdue&page=1&limit=30
// ─────────────────────────────────────────────────────────────
export const getAllLeads = async (req, res) => {
    try {
        const { status, search, followUpFilter, page = 1, limit = 50 } = req.query;
        const query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        if (followUpFilter === "today") {
            query.nextFollowUpDate = { $gte: todayStart, $lte: todayEnd };
            query.isFollowUpCompleted = { $ne: true };
        } else if (followUpFilter === "overdue") {
            query.nextFollowUpDate = { $lt: todayStart };
            query.isFollowUpCompleted = { $ne: true };
        } else if (followUpFilter === "upcoming") {
            query.nextFollowUpDate = { $gt: todayEnd };
            query.isFollowUpCompleted = { $ne: true };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [leads, total] = await Promise.all([
            Lead.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("assignedTo", "name phoneno"),
            Lead.countDocuments(query)
        ]);

        res.status(200).json({ success: true, count: leads.length, total, data: leads });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Get single lead
// GET /lead/:id
// ─────────────────────────────────────────────────────────────
export const getSingleLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate("assignedTo", "name phoneno")
            .populate("notes.addedBy", "name")
            .populate("timeline.performedBy", "name");
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
        res.status(200).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Update lead status
// PUT /lead/status/:id
// body: { status }
// ─────────────────────────────────────────────────────────────
export const updateLeadStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["New", "Contacted", "Qualified", "Quote Sent", "Won", "Lost", "Quoted", "Converted", "Closed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(", ")}` });
        }

        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        const oldStatus = lead.status;
        lead.status = status;
        lead.timeline.push({
            action: "Status Changed",
            details: `${oldStatus} → ${status}`,
            performedBy: req.user?._id || null,
            performedByName: req.user?.name || "Admin"
        });
        await lead.save();

        res.status(200).json({ success: true, message: "Lead status updated", data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Schedule or update follow-up
// PUT /lead/follow-up/:id
// body: { nextFollowUpDate, followUpTime, followUpPriority, followUpNotes, isFollowUpCompleted, assignedTo }
// ─────────────────────────────────────────────────────────────
export const updateLeadFollowUp = async (req, res) => {
    try {
        const { nextFollowUpDate, followUpTime, followUpPriority, followUpNotes, isFollowUpCompleted, assignedTo } = req.body;

        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        if (nextFollowUpDate !== undefined) lead.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
        if (followUpTime !== undefined) lead.followUpTime = followUpTime;
        if (followUpPriority !== undefined) lead.followUpPriority = followUpPriority;
        if (followUpNotes !== undefined) lead.followUpNotes = followUpNotes;
        if (isFollowUpCompleted !== undefined) lead.isFollowUpCompleted = Boolean(isFollowUpCompleted);
        if (assignedTo !== undefined) lead.assignedTo = assignedTo || null;

        lead.timeline.push({
            action: isFollowUpCompleted ? "Follow-up Completed" : "Follow-up Scheduled",
            details: nextFollowUpDate ? `Due: ${new Date(nextFollowUpDate).toLocaleDateString("en-IN")}${followUpTime ? " at " + followUpTime : ""} [${followUpPriority || "Medium"}]` : "Cleared",
            performedBy: req.user?._id || null,
            performedByName: req.user?.name || "Admin"
        });

        await lead.save();
        res.status(200).json({ success: true, message: "Follow-up updated successfully", data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Add a note to a lead
// POST /lead/note/:id
// body: { text }
// ─────────────────────────────────────────────────────────────
export const addLeadNote = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: "Note text is required" });
        }

        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        lead.notes.push({ text: text.trim(), addedBy: req.user._id });
        lead.timeline.push({
            action: "Note Added",
            details: text.trim().slice(0, 100),
            performedBy: req.user._id,
            performedByName: req.user.name || "Admin"
        });
        await lead.save();

        res.status(200).json({ success: true, message: "Note added", data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Delete a lead
// DELETE /lead/:id
// ─────────────────────────────────────────────────────────────
export const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
        res.status(200).json({ success: true, message: "Lead deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — Lead count stats & Follow-up counters (for dashboard card & CRM pipeline)
// GET /leads/stats
// ─────────────────────────────────────────────────────────────
export const getLeadStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [stats, total, todayCount, overdueCount] = await Promise.all([
            Lead.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Lead.countDocuments(),
            Lead.countDocuments({
                nextFollowUpDate: { $gte: todayStart, $lte: todayEnd },
                isFollowUpCompleted: { $ne: true }
            }),
            Lead.countDocuments({
                nextFollowUpDate: { $lt: todayStart },
                isFollowUpCompleted: { $ne: true }
            })
        ]);

        const data = {};
        stats.forEach(s => { data[s._id] = s.count; });

        res.status(200).json({
            success: true,
            data,
            total,
            followUpsToday: todayCount,
            followUpsOverdue: overdueCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
