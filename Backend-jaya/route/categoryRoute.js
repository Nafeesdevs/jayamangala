import express from "express";
import { createcategory, deleteCategory, getallcategory, getsinglecategory, updateCategory } from "../controller/categoryController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/category").post(verifyUser, isAdmin, upload.single("image"), createcategory).get(getallcategory)
router.route("/category/:id").get(getsinglecategory).put(verifyUser, isAdmin, upload.single("image"), updateCategory).delete(verifyUser, isAdmin, deleteCategory)
export default router;
