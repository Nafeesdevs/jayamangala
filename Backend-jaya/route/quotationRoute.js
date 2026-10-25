import express from "express";
import {
    createQuotation,
    getLeadQuotations,
    updateQuotationStatus,
    getSingleQuotation
} from "../controller/quotationController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";

const router = express.Router();

router.post("/quotation", verifyUser, isAdmin, createQuotation);
router.get("/quotations/lead/:leadId", verifyUser, isAdmin, getLeadQuotations);
router.get("/quotation/:id", verifyUser, isAdmin, getSingleQuotation);
router.put("/quotation/status/:id", verifyUser, isAdmin, updateQuotationStatus);

export default router;

