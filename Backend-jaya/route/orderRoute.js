import express from "express";
import {
    createorder, getallorder, getsingleorder, getmyorders, getuserorders, trackOrder,
    getOrderStatusStats, updateOrderStatus, updateOrder, cancelOrder, deleteOrder
} from "../controller/orderController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";
const router = express.Router();

router.post("/order", verifyUser, createorder);                       // create (needs paymentId)
router.get("/orders", verifyUser, isAdmin, getallorder);              // admin: all orders
router.get("/orders/my", verifyUser, getmyorders);                    // logged-in user's orders
router.get("/orders/stats", verifyUser, isAdmin, getOrderStatusStats);
router.get("/orders/user/:userId", verifyUser, getuserorders);        // single user's orders

router.get("/order/track/:id", verifyUser, trackOrder);               // track order
router.put("/order/status/:id", verifyUser, isAdmin, updateOrderStatus); // update order status
router.put("/order/cancel/:id", verifyUser, cancelOrder);             // customer cancel
router.route("/order/:id")
    .get(verifyUser, getsingleorder)                                  // single order
    .put(verifyUser, isAdmin, updateOrder)
    .delete(verifyUser, isAdmin, deleteOrder);
export default router;
