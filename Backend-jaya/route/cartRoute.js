import express from "express"
import { addToCart, clearCart, getCart, removeFromCart, updateCartQuantity } from "../controller/cartController.js"
import { verifyUser } from "../helper/userAuth.js"
const router = express.Router()

router.post("/cart", verifyUser, addToCart)
router.get("/cart", verifyUser, getCart)
router.put("/cart/update", verifyUser, updateCartQuantity)
router.post("/cart/remove", verifyUser, removeFromCart)
router.delete("/cart", verifyUser, clearCart)
export default router
