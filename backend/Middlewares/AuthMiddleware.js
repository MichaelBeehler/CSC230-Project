import User from "../Models/UserModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const userVerification = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({success: false, message: "Unauthorized: No token provided"});
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.status(401).json({success: false, message: "An error occurred when authorizing the token"});
        }

        const user = await User.findById(data.id);
        if (user) {
            req.user = user;
            next();  
        } else {
            return res.status(401).json({success: false, message: "User does not have access to this resource"});
        }
    });
};

