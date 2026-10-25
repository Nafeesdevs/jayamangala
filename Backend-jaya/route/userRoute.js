import express from 'express';
import rateLimit from "express-rate-limit";
import {
    createuser, loginUser, Logoutuser,
    getMyProfile, updateMyProfile, getMyOrderTotal,
    createUserByAdmin, getAllUsers, getUserById, updateUser, deleteUser, getUserOrderTotal
} from '../controller/userController.js';
import { verifyUser, isAdmin } from '../helper/userAuth.js';
const router = express.Router();

// Rate limiting for public login & registration to block brute-force attempts
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 15, // max 15 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication attempts. Please try again after 15 minutes." }
});

// auth
router.route("/register").post(authRateLimit, createuser)
router.route("/login").post(authRateLimit, loginUser)
router.route("/logout").get(Logoutuser)

// profile (logged-in user)
router.route("/profile").get(verifyUser, getMyProfile).put(verifyUser, updateMyProfile)
router.route("/profile/order-total").get(verifyUser, getMyOrderTotal)

// user crud (admin)
router.route("/users").get(verifyUser, isAdmin, getAllUsers).post(verifyUser, isAdmin, createUserByAdmin)
router.route("/user/:id").get(verifyUser, isAdmin, getUserById).put(verifyUser, isAdmin, updateUser).delete(verifyUser, isAdmin, deleteUser)
router.route("/user/:id/order-total").get(verifyUser, isAdmin, getUserOrderTotal)

export default router;
