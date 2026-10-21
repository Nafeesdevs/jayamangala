import express from 'express';
import {
    createuser, loginUser, Logoutuser,
    getMyProfile, updateMyProfile, getMyOrderTotal,
    createUserByAdmin, getAllUsers, getUserById, updateUser, deleteUser, getUserOrderTotal
} from '../controller/userController.js';
import { verifyUser, isAdmin } from '../helper/userAuth.js';
const router = express.Router();

// auth
router.route("/register").post(createuser)
router.route("/login").post(loginUser)
router.route("/logout").get(Logoutuser)

// profile (logged-in user)
router.route("/profile").get(verifyUser, getMyProfile).put(verifyUser, updateMyProfile)
router.route("/profile/order-total").get(verifyUser, getMyOrderTotal)

// user crud (admin)
router.route("/users").get(verifyUser, isAdmin, getAllUsers).post(verifyUser, isAdmin, createUserByAdmin)
router.route("/user/:id").get(verifyUser, isAdmin, getUserById).put(verifyUser, isAdmin, updateUser).delete(verifyUser, isAdmin, deleteUser)
router.route("/user/:id/order-total").get(verifyUser, isAdmin, getUserOrderTotal)

export default router;
