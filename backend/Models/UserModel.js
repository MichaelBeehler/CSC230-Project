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
    created_at: {
        type: Date,
        default: new Date(),
    },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

export default mongoose.model("User", userSchema);
/**
 * User Model Documentation
 * 
 * @description Mongoose schema for user registration and authentication
 * @module UserModel
 */

/**
 * User Schema Definition
 * 
 * @typedef {Object} UserSchema
 * @property {string} firstName - User's first name (required)
 * @property {string} lastName - User's last name (required)
 * @property {string} email - Unique email address for user registration (required)
 * @property {string} password - User's password (required, will be hashed)
 * @property {string} role - User's role in the system (required)
 * @property {Date} created_at - Timestamp of user account creation
 */

/**
 * Password Pre-Save Middleware
 * 
 * @description Automatically hashes user password before saving to database
 * @method pre
 * @param {string} event - 'save' event trigger
 * @returns {Promise} Hashed password using bcrypt
 */

/**
 * Security Features:
 * - Required field validation
 * - Unique email constraint
 * - Automatic password hashing
 * - Role-based user classification
 */
/**
 * User Login Display
 * 
 * @description Displays user's first name and last name upon successful login
 * @function displayUserName
 * @param {Object} user - User object containing firstName and lastName
 * @returns {string} Formatted full name for personalized login greeting
 * 
 * @example
 * // Returns "John Doe"
 * displayUserName({ firstName: 'John', lastName: 'Doe' })
 * 
 * @feature Provides personalized user experience by showing user's full name
 * @note Enhances user interface with personalized login acknowledgment
 */
/** 
 * User Model Documentation
 * 
 * @description Mongoose schema for user registration and authentication
 * @module UserModel
 */

/**
 * User Schema Definition
 * 
 * @typedef {Object} UserSchema
 * @property {string} firstName - User's first name (required)
 * @property {string} lastName - User's last name (required)
 * @property {string} email - Unique email address for user registration (required)
 * @property {string} password - User's password (required, will be hashed)
 * @property {string} role - User's role in the system (required)
 * @property {Date} created_at - Timestamp of user account creation
 */

/**
 * Password Pre-Save Middleware
 * 
 * @description Automatically hashes user password before saving to database
 * @method pre
 * @param {string} event - 'save' event trigger
 * @returns {Promise} Hashed password using bcrypt
 */

/**
 * Security Features:
 * - Required field validation
 * - Unique email constraint
 * - Automatic password hashing
 * - Role-based user classification
 */
/**
 * User Profile Debug Information
 * 
 * @description Provides detailed debug information about a user's profile
 * @module UserProfileDebug
 * 
 * @property {string} email - User's registered email address
 * @property {string} role - User's assigned role in the system
 * 
 * @debug-keys {Array} userObjectKeys - List of keys in the user object
 * - _id: Unique MongoDB document identifier
 * - email: User's email address
 * - role: User's system role
 * - created_at: Timestamp of user account creation
 * - __v: MongoDB version key
 * 
 * @example
 * // Debug output structure
 * {
 *   "_id": "67cd3f07a36153643c4647db",
 *   "email": "DaRealest21@porkpay.com", 
 *   "role": "student",
 *   "created_at": "2025-03-09T07:02:40.284Z",
 *   "__v": 0
 * }
 * 
 * @note This is temporary debug information and should be removed in production
 * @warning Contains sensitive user information, handle with care
 */
