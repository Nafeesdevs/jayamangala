import express from "express"
import { createproduct, deleteproduct, getallproduct, getProductsByCategoryName, getsingleproduct, updateproduct } from "../controller/productController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router()
router.route("/products").get(getallproduct).post(verifyUser, isAdmin, upload.single("productimage"), createproduct)
router.route("/product/:id").get(getsingleproduct).put(verifyUser, isAdmin, upload.single("productimage"), updateproduct).delete(verifyUser, isAdmin, deleteproduct)
router.get("/products/category/:categoryName", getProductsByCategoryName)
export default router;
