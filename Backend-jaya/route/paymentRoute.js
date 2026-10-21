import express from "express";
import {
    getPaymentQR, uploadPaymentScreenshot, getMyPayments,
    getAllPayments, getSinglePayment, updatePaymentStatus, deletePayment
} from "../controller/paymentController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";
import upload from "../middleware/upload.js";
const router = express.Router();

router.get("/payment/qr", verifyUser, getPaymentQR)
router.post("/payment/upload", verifyUser, upload.single("screenshot"), uploadPaymentScreenshot)
router.get("/payment/my", verifyUser, getMyPayments)

// admin
router.get("/payments", verifyUser, isAdmin, getAllPayments)
router.put("/payment/status/:id", verifyUser, isAdmin, updatePaymentStatus)
router.route("/payment/:id").get(verifyUser, getSinglePayment).delete(verifyUser, isAdmin, deletePayment)
export default router;
