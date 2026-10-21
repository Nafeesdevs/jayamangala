import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

export const verifyUser = async (req, res, next) => {
    try {

        let token;

        // Get token from Authorization header (or cookie)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. Login Required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Contact admin"
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};


// Middleware to check if the logged-in user is an admin
export const isAdmin = (req, res, next) => {
    // req.user was populated by verifyUser middleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
};
