import mongoose from 'mongoose';
import { User } from '../models/User.js';


export const registerUser = async (req, res) => {
    const { firstName, lastName, userName, email, password} = req.body;

    try {
        //validation
        if (!firstName || !lastName || !userName || !email || !password) {
            return res.send(400).json({ success: false, message: "All fields are required."});
        }
        if (email.includes("@") || email.includes(".")) {
            return res.send(400).json({ success: false, message: "Invalid email format."});
        }
        if (password.length < 8) {
            return res.send(400).json({ success: false, message: "Password must be atleast 8 characters long"});
        }


        //check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send(400).json({ success: false, message: "email already exist."});
        }

        //create the user
        const newUser = new User({
            firstName,
            lastName,
            userName,
            email,
            password
        })

        const savedUser = await newUser.save();
    
    } catch (error) {
        console.error("Error creating user", error);
        return res.send(500).json({ success: false, message: "Error in Creating User."})
    }
}