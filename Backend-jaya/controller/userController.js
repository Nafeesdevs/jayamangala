import mongoose from "mongoose";
import User from "../model/userModel.js";
import Order from "../model/orderModel.js";
import { sendToken, getCookieOptions } from "../helper/jwtToken.js";

// ---------------------------------------------------------------
// SEED  (admin + demo user) - called from server.js after DB connect
// ---------------------------------------------------------------
export const seedDefaultUsers = async () => {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const allowDemo = process.env.ENABLE_DEMO_SEED === "true";

        // Never seed generic demo accounts in production unless explicitly enabled
        if (isProd && !allowDemo) {
            return;
        }

        const adminPhone = process.env.ADMIN_PHONE;
        if (adminPhone && !(await User.findOne({ phoneno: adminPhone }))) {
            await User.create({
                name: process.env.ADMIN_NAME || "Super Admin",
                phoneno: adminPhone,
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD || "Admin@123",
                role: "admin",
            });
            console.log("✅ Default Admin created");
        }

        const demoPhone = process.env.DEMO_PHONE;
        if (demoPhone && !(await User.findOne({ phoneno: demoPhone }))) {
            await User.create({
                name: process.env.DEMO_NAME || "Demo User",
                phoneno: demoPhone,
                email: process.env.DEMO_EMAIL,
                password: process.env.DEMO_PASSWORD || "Demo@123",
                role: "customer",
            });
            console.log("✅ Demo User created");
        }
    } catch (error) {
        console.error("❌ Error seeding users:", error.message);
    }
};

// helper: total amount + counts of orders of one user (cancelled orders are not counted in amount)
const getOrderTotals = async (userId) => {
    const result = await Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
                totalAmount: {
                    $sum: { $cond: [{ $ne: ["$status", "Cancelled"] }, "$pricing.total", 0] }
                },
            }
        }
    ]);
    return result[0]
        ? { totalOrders: result[0].totalOrders, cancelledOrders: result[0].cancelledOrders, totalAmount: result[0].totalAmount }
        : { totalOrders: 0, cancelledOrders: 0, totalAmount: 0 };
};

// ---------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------
export const createuser = async (req, res) => {
    try {
        const { name, phoneno, email, password } = req.body;

        if (!name || !phoneno || !password) {
            return res.status(400).json({ success: false, message: "Name, phone number and password are required" });
        }

        const existingUser = await User.findOne({ phoneno });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Phone number already registered."
            });
        }

        // role is always customer on public register
        const newUser = await User.create({ name, phoneno, email, password, role: "customer" });

        sendToken(newUser, 201, res);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { phoneno, password } = req.body;

        if (!phoneno || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both phone number and password"
            });
        }

        const user = await User.findOne({ phoneno }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: "Phone number not registered" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Your account is deactivated. Contact admin" });
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        sendToken(user, 200, res);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const Logoutuser = async (req, res) => {
    const options = getCookieOptions();
    options.expires = new Date(0);
    res.cookie("token", "", options);
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ---------------------------------------------------------------
// PROFILE (logged-in user)
// ---------------------------------------------------------------
export const getMyProfile = async (req, res) => {
    try {
        const orderSummary = await getOrderTotals(req.user._id);
        res.status(200).json({ success: true, data: req.user, orderSummary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const { name, email, addresses, oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (addresses !== undefined) user.addresses = addresses;

        // change password (old password is required)
        if (newPassword) {
            if (!oldPassword || !(await user.comparePassword(oldPassword))) {
                return res.status(400).json({ success: false, message: "Old password is incorrect" });
            }
            user.password = newPassword;
        }

        await user.save();

        const userObject = user.toObject();
        delete userObject.password;

        res.status(200).json({ success: true, message: "Profile updated successfully", data: userObject });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// total amount of all orders of the logged-in user
export const getMyOrderTotal = async (req, res) => {
    try {
        const data = await getOrderTotals(req.user._id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------
// USER CRUD (admin)
// ---------------------------------------------------------------
export const createUserByAdmin = async (req, res) => {
    try {
        const { name, phoneno, email, password, role } = req.body;

        if (!name || !phoneno || !password) {
            return res.status(400).json({ success: false, message: "Name, phone number and password are required" });
        }
        if (await User.findOne({ phoneno })) {
            return res.status(400).json({ success: false, message: "Phone number already registered." });
        }

        const user = await User.create({ name, phoneno, email, password, role: role === "admin" ? "admin" : "customer" });
        const userObject = user.toObject();
        delete userObject.password;

        res.status(201).json({ success: true, message: "User created successfully", data: userObject });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// all users + each user's order total amount
export const getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { phoneno: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 }).lean();

        const totals = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: "$user", totalAmount: { $sum: "$pricing.total" }, totalOrders: { $sum: 1 } } }
        ]);
        const totalMap = {};
        totals.forEach(t => { totalMap[String(t._id)] = t; });

        const data = users.map(u => ({
            ...u,
            totalOrders: totalMap[String(u._id)]?.totalOrders || 0,
            totalAmount: totalMap[String(u._id)]?.totalAmount || 0,
        }));

        res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const orderSummary = await getOrderTotals(id);
        res.status(200).json({ success: true, data: user, orderSummary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive, password, addresses } = req.body;

        const user = await User.findById(id).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (addresses !== undefined) user.addresses = addresses;
        if (isActive !== undefined) user.isActive = isActive;
        if (role && ["customer", "admin"].includes(role)) user.role = role;
        if (password) user.password = password;

        await user.save();
        const userObject = user.toObject();
        delete userObject.password;

        res.status(200).json({ success: true, message: "User updated successfully", data: userObject });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (String(req.user._id) === id) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account" });
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// order total amount of a particular user (admin)
export const getUserOrderTotal = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }
        const data = await getOrderTotals(id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
