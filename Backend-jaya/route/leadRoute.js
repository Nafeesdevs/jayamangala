import express from "express";
import rateLimit from "express-rate-limit";
import {
    createLead,
    getAllLeads,
    getSingleLead,
    updateLeadStatus,
    updateLeadFollowUp,
    addLeadNote,
    deleteLead,
    getLeadStats
} from "../controller/leadController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";

const router = express.Router();

// Rate limit for public lead submission — max 5 submissions per IP per 15 minutes
const leadSubmitLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many enquiries submitted. Please try again after 15 minutes." }
});

// Public — anyone can submit a lead (rate-limited)
router.post("/lead", leadSubmitLimit, createLead);

// Admin only
router.get("/leads", verifyUser, isAdmin, getAllLeads);
router.get("/leads/stats", verifyUser, isAdmin, getLeadStats);
router.get("/lead/:id", verifyUser, isAdmin, getSingleLead);
router.put("/lead/status/:id", verifyUser, isAdmin, updateLeadStatus);
router.put("/lead/follow-up/:id", verifyUser, isAdmin, updateLeadFollowUp);
router.post("/lead/note/:id", verifyUser, isAdmin, addLeadNote);
router.delete("/lead/:id", verifyUser, isAdmin, deleteLead);

export default router;
