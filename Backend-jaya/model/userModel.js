import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({

    name: String,
    phoneno: {
        type: String,
        required: true,
        unique: true,
    },
    email: String,
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    password: {
        type: String,
        required: true,
        select: false // Exclude password from query results by default
    },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        isDefault: { type: Boolean, default: false }
    }],
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcryptjs.hash(this.password, 10);
})

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id, role: this.role },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema)
export default User;
