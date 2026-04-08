import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { compare } from 'bcrypt';
import { generateTokenAndCookie } from '../utils/generateTokenAndCookie.js';
import { Role } from '../models/Role.js';
import { Permission } from '../models/Permission.js';

export const registerUser = async (req, res) => {
    const { firstName, lastName, userName, email, password, role} = req.body;

    try {
        //basic validation
        if (!firstName || !lastName || !userName || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required."});
        }
        if (!email.includes("@") || !email.includes(".")) {
            return res.status(400).json({ success: false, message: "Invalid email format."});
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be atleast 8 characters long"});
        }

        //check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "email already exist."});
        }

        // 1. Identify which role we need (Default to "User" if none provided)
        const targetRoleName = role || "User";

        // 2. Find the Role document where the field 'roleName' matches our target
        const roleDoc = await Role.findOne({ roleName: targetRoleName });

        if (!roleDoc) {
            return res.status(400).json({ 
                success: false, 
                message: `Role '${targetRoleName}' does not exist.` 
            });
        }

        // 3. Create the user
        const newUser = new User({
            firstName,
            lastName,
            userName,
            email,
            password,
            role: roleDoc._id // Linking the ObjectId to the User's 'role' field
        });

        const savedUser = await newUser.save();

        // 4. Send back the response with the role details
        const populatedUser = await User.findById(savedUser._id)
            .populate({
                path: 'role',
                select: 'roleName permissions'
            });

        return res.status(201).json({ 
            success: true, 
            message: "User created successfully!", 
            user: populatedUser 
        });

    } catch (error) {
        console.error("Error creating user", error);
        return res.status(500).json({ success: false, message: "Error in Creating User." });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required."});
        }

        // 2. Find user with deep population
        const user = await User.findOne({ email })
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    select: 'permissionName description'
                }
            })
            .select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: "Incorrect email or password."});
        }

        // 3. Compare password using your schema method
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect email or password."});
        }

        // 4. If match, issue Token/Cookie and send ONE response
        generateTokenAndCookie(res, user);

        const userObject = user.toObject();
        delete userObject.password;

        return res.status(200).json({ 
            success: true, 
            message: "Login successful.", 
            user: userObject 
        });

    } catch (error) {
        console.error("Error logging in user", error);
        // Safety check to prevent double-response crashes in the catch block
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error in Logging In User." });
        }
    }
}

// export const userProfile = async (req, res) => {
//     const { id } = req.params;
//     try {
        
//     }
// }