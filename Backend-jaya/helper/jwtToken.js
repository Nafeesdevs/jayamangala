/**
 * Send JWT Token via HTTP response.
 *
 * Dual Authentication Architecture:
 * 1. Bearer Token in JSON body: Guarantees 100% reliable cross-origin authentication
 *    between Vercel frontend (e.g. *.vercel.app) and Render backend (e.g. *.onrender.com),
 *    completely immune to Safari/Chrome third-party cookie blocking (ITP/CHIPS) and cross-site CSRF.
 * 2. HttpOnly Cookie: Configured with standard secure practices for same-site custom domain
 *    or supported browsers. In production cross-site contexts, sameSite is set to "none" with secure=true.
 */
export const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    const cookieDays = parseInt(process.env.EXPIRE_COOKIE, 10) || 7;

    return {
        expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProd,
        // In cross-site production (Vercel <-> Render), SameSite must be "none" if secure is true.
        // In local development, "lax" permits normal localhost navigation.
        sameSite: isProd ? "none" : "lax",
        path: "/",
    };
};

export const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    const userObject = user.toObject();
    delete userObject.password;

    const options = getCookieOptions();

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user: userObject,
        token,
    });
};
