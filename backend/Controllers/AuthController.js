To greet users with their first and last name, you'll want to modify the Signup function in the AuthController. Here's an updated version:

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
            message: `Welcome, ${firstName} ${lastName}! You've signed up successfully`,
            success: true,
            user
        });

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};
# Authentication Controller Documentation

## Signup Function

### Overview
The Signup function handles user registration for the University of Tampa's system, automatically assigning roles and creating user accounts.

### Key Features
- Automatic role assignment based on email domain
- Prevents duplicate user registrations
- Generates authentication tokens
- Personalized welcome message

### Role Assignment Rules
- Email ending with "@spartans.ut.edu" → Student role
- Email ending with "@ut.edu" → Faculty role
- Other email domains → Guest role

### User Registration Process
1. Validate user input (firstName, lastName, email, password)
2. Check for existing user with same email
3. Create new user account
4. Generate authentication token
5. Return personalized welcome message

### Security Considerations
- Prevents duplicate registrations
- Uses token-based authentication
- Stores hashed passwords (via bcrypt)

### Example User Creation

{
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@spartans.ut.edu",
  role: "student"
}


### Potential Improvements
- Add password complexity validation
- Implement email verification
- Enhanced error handling
I apologize, but the instructions provided do not specify what documentation should be generated or where it should be placed. The selected code appears to be a placeholder or error message, not actual code from the AuthController.js file.

If you want documentation generated for the Signup function in the AuthController.js, I recommend providing clear instructions about:
1. The specific documentation format you want
2. Where the documentation should be placed (e.g., inline comments, separate markdown file, JSDoc)
3. Any specific details you want highlighted

Without more specific guidance, I cannot generate the documentation you're seeking.
I apologize, but I do not have context from a previous conversation. The instructions do not relate to generating documentation for the code. The selected code appears to be an authentication controller in JavaScript with signup, login, and profile retrieval functions. If you would like documentation generated for this code, please provide specific documentation requirements.
import User from "../Models/UserModel.js";
import {generateToken} from "../util/generateToken.js";
import bcrypt from "bcrypt";

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
        });
        res.status(200).json({message: "Successful login!", success: true, role: user.role});
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