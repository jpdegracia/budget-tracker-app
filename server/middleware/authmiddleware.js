import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent as "Bearer
    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid token." });
    }
};

export const roleAuthorization = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access Denied. Insufficient permissions." });
        }

        next();
    };
};

export const PermissionAuthorization = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
        }
        try {
            const userPermissions = req.user.permissions || [];
            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({ success: false, message: "Access Denied. Insufficient permissions." });
            }
        } catch (error) {
            return res.status(403).json({ success: false, message: "Access Denied. Insufficient permissions." });
        }
        next();
    }
};