import User from "../Models/UserModel.js";
import {generateToken} from "../util/generateToken.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config()

// Function that assigns a role based on the user's email (student / faculty / guest).
function assignRole (email) {
    if (email.endsWith("@spartans.ut.edu")) {
        return "student";
    }
    if (email.endsWith("@ut.edu")) {
        return "faculty";
    }
    return "guest"
}

export const Signup = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, createdAt } = req.body;
        const role = assignRole(email);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists!" });
        }

    

        // Create new user with first and last name
        const user = await User.create({ firstName, lastName, email, password, role, createdAt });

        // Generate authentication token
        const token = generateToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });

        res.status(201).json({
            message: "User signed up successfully",
            success: true,
            user
        });

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};


export const Login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.json ({message: "Please enter the required fields"});
        }
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json ({message: "Invalid email or password", success: false});
        }
        const auth = await bcrypt.compare(password, user.password)
        if (!auth){
            return res.status(401).json({message: "Invalid email or password", success: false});
        }
        const token = generateToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: true,
            secure: true, 
            sameSite: 'None',

        });
        res.status(200).json({message: "Successful login!", success: true, role: user.role, token});
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error", success: false});
    }
}


export const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password"); // Exclude password
      if (!user) return res.status(404).json({ message: "User not found" });
      
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async function sendResetEmail(toEmail, resetToken) {
    const resetLink = `https://csc-230-project.vercel.app/reset-password/${resetToken}`;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Reset Your Password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, ignore this email.</p>
      `
    };
  
    return transporter.sendMail(mailOptions);
  }

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
    
        const existingUser = await User.findOne({ email });
    
        if (!existingUser) {
          return res.status(404).json({ success: false, message: "User not found" }); ////////////// Change this to just send back true (for security reasons)
        }
    
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
    
        // Save token to user in DB 
        existingUser.resetToken = resetToken;
        existingUser.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await existingUser.save();
    
        // Send email
        await sendResetEmail(email, resetToken);
    
        return res.json({ success: true, message: "Reset email sent" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // still valid
    });
  
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }
  
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
  
    res.json({ success: true });
}

