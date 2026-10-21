import express from "express";
import { createbrand, deletebrand, getallbrand, getsinglebrand, updatebrand } from "../controller/brandController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/brand").post(verifyUser, isAdmin, upload.single("image"), createbrand).get(getallbrand)
router.route("/brand/:id").get(getsinglebrand).put(verifyUser, isAdmin, upload.single("image"), updatebrand).delete(verifyUser, isAdmin, deletebrand)
export default router;
