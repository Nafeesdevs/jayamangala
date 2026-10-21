import express from "express"
import { clearWishlist, getUserWishlist, moveToCart, removeFromWishlist, toggleWishlist } from "../controller/whislistController.js"
import { verifyUser } from "../helper/userAuth.js"
const router = express.Router()

router.post("/whislist", verifyUser, toggleWishlist)
router.get("/whislist", verifyUser, getUserWishlist)
router.post("/whislist/move-to-cart", verifyUser, moveToCart)
router.delete("/whislist/item/:productId", verifyUser, removeFromWishlist)
router.delete("/whislist", verifyUser, clearWishlist)

export default router;
