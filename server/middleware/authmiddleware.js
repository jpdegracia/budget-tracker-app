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
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Convert the user's role to lowercase
        const userRole = req.user.role.toLowerCase();
        
        // Convert the allowedRoles array to lowercase
        const normalizedRoles = allowedRoles.map(role => role.toLowerCase());

        console.log(`DEBUG: Comparing user role [${userRole}] against [${normalizedRoles}]`);

        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({ 
                success: false, 
                message: `Forbidden: Role ${req.user.role} does not have access.` 
            });
        }
        next();
    };
};


export const permissionAuthorization = (requiredPermission) => {
    return (req, res, next) => {
        // 1. Check if the user exists (from verifyToken)
        if (!req.user || !req.user.permissions) {
            return res.status(401).json({ 
                success: false, 
                message: "Access Denied. No permissions found." 
            });
        }

        // 2. Normalize both for case-insensitivity
        const userPermissions = req.user.permissions.map(p => p.toLowerCase());
        const targetPermission = requiredPermission.toLowerCase();

        // 3. Perform the check
        const hasPermission = userPermissions.includes(targetPermission);

        if (!hasPermission) {
            console.warn(`🛑 Access Blocked: User ${req.user.id} missing [${requiredPermission}]`);
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied. You do not have the '${requiredPermission}' permission.` 
            });
        }

        // 4. Success!
        next();
    };
};