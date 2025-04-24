import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required!"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required!"],
    },
    email: {
        type: String,
        required: [true, "Email address is required!"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role: {
        type: String,
        required: [true, "You must select a role"],
    },
    profilePicture: {
        type: String,
        default: null
    },
  
    created_at: {
        type: Date,
        default: new Date(),
    },

    resetToken: {
        type: String,
        default: null,
      },
      resetTokenExpiry: {
        type: Date,
        default: null,
      },
      
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

export default mongoose.model("User", userSchema);
