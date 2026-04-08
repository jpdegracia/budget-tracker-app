import jwt from 'jsonwebtoken';
import { Permission } from '../models/Permission.js';

export const generateTokenAndCookie = (res, user) => {
    const permissionList = user.role.permissions.map(p => p.permissionName);

    // 2. Create the JWT payload
    const payload = {
        id: user._id,
        role: user.role.roleName,
        permissions: permissionList
    };

    // 3. Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d', // Set to 7 days or your preferred duration
    });

    // console.log(`Bearer ${token}`);

    // 4. Set the Cookie
    res.cookie('token', token, {
        httpOnly: true, // Prevents XSS attacks (JS cannot read the cookie)
        secure: process.env.NODE_ENV === 'production', // Only sends over HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return token;
};