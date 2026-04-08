import mongoose from 'mongoose';
import { Role } from '../models/Role.js';
import { Permission } from '../models/Permission.js';
import { User } from '../models/User.js';

//desc Create a new role with specified permissions
//route POST /roles
//access Private (requires Role: Admin and Permission: role:create)
export const createRole = async (req, res) => {
    const {roleName, permissions: permissionIds} = req.body;

    try {
        // validation for roleName
        if (!roleName || roleName.trim() === "" || typeof roleName !== "string") {
            return res.status(400).json({ success: false, message: "Role Name is Required." });
        }

        // validation for permissions array
        if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({ success: false, message: "Permissions array is required and cannot be empty." });
        }

        //all elements in the permissions array should be valid ObjectIds
        const invalidPermissionIds = permissionIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidPermissionIds.length > 0) {
            return res.status(400).json({ success: false, message: `Invalid permission IDs: ${invalidPermissionIds.join(", ")}` });
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ roleName: roleName.toLowerCase().trim() });
        if (existingRole) {
            return res.status(400).json({ success: false, message: `Role '${roleName}' already exists.` });
        }

        // validate that all provided permission IDs exist in collection
        if (permissionIds.length > 0) {
            const foundPermissions = await Permission.find({ _id: { $in: permissionIds } });
            if (foundPermissions.length !== permissionIds.length) {
                const foundIds = foundPermissions.map(permission => permission._id.toString());
                const notFoundIds = permissionIds.filter(id => !foundIds.includes(id));
                return res.status(400).json({ success: false, message: `The following permission IDs do not exist: ${notFoundIds.join(", ")}` });
            }
        }

        // Create the role
        const newRole = new Role({
            roleName: roleName.toLowerCase().trim(),
            permissions: permissionIds
        });
        const savedRole = await newRole.save();

        const populatedRole = await Role.findById(savedRole._id)
            .populate({
                path: 'permissions',
                select: 'permissionName description'
            });

        return res.status(201).json({ success: true, message: "Role created successfully!", role: populatedRole });
    } catch (dberror) {
        console.error("Error creating role", dberror);
        if (dberror.code === 11000) { // Duplicate key error (e.g., role name unique constraint)
            return res.status(409).json({ success: false, message: `ROLE_NAME_ALREADY_EXISTS_DB_CONFLICT` });
        }
        if (dberror instanceof mongoose.Error.ValidationError) { // Mongoose validation errors (e.g., from schema definition)
            const errors = Object.values(dberror.errors).map(err => err.message);
            console.warn("Backend createRole: Mongoose validation error:", errors.join(', '));
            return res.status(400).json({ success: false, message: `MONGOOSE_VALIDATION_FAILED: ${errors.join(', ')}` });
        }
        // Generic server error for unhandled exceptions
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_CREATING_ROLE' });
    }
};


//desc Get all roles with their permissions
//route GET /roles
//access Private (requires Role: Admin and Permission: role:read_all)
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({})
            .populate({
                path: 'permissions',
                select: 'permissionName description'
            });

        return res.status(200).json({ 
            success: true,
            count: roles.length, 
            roles 
        });
    } catch (error) {
        console.error("Error fetching roles", error);
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_FETCHING_ROLES' });
    }
}


//desc Get a role by ID with its permissions
//route GET /roles/:id
//access Private (requires Role: Admin and Permission: role:read)
export const getRoleById = async (req, res) => {
    const { id: roleId } = req.params;

    try {
        //validation for id
        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({ success: false, message: "Invalid role ID." });
        }

        const role = await Role.findById(roleId)
            .populate({
                path: 'permissions',
                select: 'permissionName description'
            });
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found." });
        }
        return res.status(200).json({ success: true, role });
    } catch (error) {
        console.error("Error fetching role", error);
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_FETCHING_ROLE' });
    }
}

//desc Update a role's name and/or permissions
//route PUT /roles/:id
//access Private (requires Role: Admin and Permission: role:update)
export const updateRole = async (req, res) => {
    const { id: roleId } = req.params;
    const { roleName, permissions: permissionIds } = req.body;

    try {
        //roleName validation (if provided)
        if (roleName !== undefined) {
            if (typeof roleName !== "string" || roleName.trim() === "") {
                return res.status(400).json({ success: false, message: "Role Name must be a non-empty string." });
            }
        }

        //permission field existence and validation (if provided)
        if (permissionIds !== undefined || !Array.isArray(permissionIds)) {
            if (!Array.isArray(permissionIds)) {
                return res.status(400).json({ success: false, message: "Permissions field must be an array." });
            }
        }

        //all elements in the permission array must be valid ObjectIds (if provided)
        const invalidPermissionIds = permissionIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidPermissionIds.length > 0) {
                return res.status(400).json({ success: false, message: `Invalid permission IDs: ${invalidPermissionIds.join(", ")}` });
            }

        // Check if role exists
        const existingRole = await Role.findByOne({ roleName: roleName.toLowerCase().trim(), _id: { $ne: roleId } });
        if (!existingRole) {
            return res.status(404).json({ success: false, message: "Role not found." });
        }

        //validate that all provided permission IDs exist in collection (if provided)
        if (permissionIds && permissionIds.length > 0) {
            const foundPermissions = await Permission.find({ _id: { $in: permissionIds } });
            if (foundPermissions.length !== permissionIds.length) {
                const foundIds = foundPermissions.map(permission => permission._id.toString());
                const notFoundIds = permissionIds.filter(id => !foundIds.includes(id));
                return res.status(400).json({ success: false, message: `The following permission IDs do not exist: ${notFoundIds.join(", ")}` });
            }
        }
        
        // Update the role
        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            { roleName: roleName.toLowerCase().trim(), permissions: permissionIds },
            { new: true, runValidators: true }
        ).populate({
            path: 'permissions',
            select: 'permissionName description'
        });

        if (!updatedRole) {
            return res.status(404).json({ success: false, message: "Role not found." });
        }

        res.status(200).json({ success: true, message: "Role updated successfully!", role: updatedRole });
    } catch (dberror) {
        console.error("Error updating role", dberror);
        if (dberror.code === 11000) { // Duplicate key error (e.g., role name unique constraint)
            return res.status(409).json({ success: false, message: `ROLE_NAME_ALREADY_EXISTS_DB_CONFLICT` });
        }
        if (dberror instanceof mongoose.Error.ValidationError) { // Mongoose validation errors (e.g., from schema definition)
            const errors = Object.values(dberror.errors).map(err => err.message);
            console.warn("Backend updateRole: Mongoose validation error:", errors.join(', '));
            return res.status(400).json({ success: false, message: `MONGOOSE_VALIDATION_FAILED: ${errors.join(', ')}` });
        }
        // Generic server error for unhandled exceptions
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_UPDATING_ROLE' });
    }
}

//desc Delete a role by ID
//route DELETE /roles/:id
//access Private (requires Role: Admin and Permission: role:delete)
export const deleteRole = async (req, res) => {
    const { id: roleId } = req.params;
    try {
        //validation for id
        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({ success: false, message: "Invalid role ID." });
        }

        const deletedRole = await Role.findByIdAndDelete(roleId);
        if (!deletedRole) {
            return res.status(404).json({ success: false, message: "Role not found." });
        }

        const userWithDeletedRole = await User.countDocuments({ role: roleId });
        if (userWithDeletedRole > 0) {
            console.warn(`Cannot delete role '${deletedRole.roleName}'. ${userWithDeletedRole} user(s) are currently assigned to this role.`);
        }

        await role.deleteOne();
        return res.status(200).json({ success: true, message: "Role deleted successfully!" });
    } catch (error) {
        console.error("Error deleting role", error);
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_DELETING_ROLE' });
    }
};


//desc Add a permission to a role
//route POST /roles/:id/permissions
//access Private (requires Role: Admin and Permission: role:add_permission)
export const addPermissionToRole = async (req, res) => {
    const { id: roleId } = req.params;
    const { permissionId } = req.body;
    try {
        //validation for roleId and permissionId
        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({ success: false, message: "Invalid role ID." });
        }
        if (!mongoose.Types.ObjectId.isValid(permissionId)) {
            return res.status(400).json({ success: false, message: "Invalid permission ID." });
        }

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found." });
        }

        // Check if permission exists
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            return res.status(404).json({ success: false, message: "Permission not found." });
        }

        // Check for duplicate permission in role
        if (role.permissions.includes(permissionId)) {
            return res.status(400).json({ success: false, message: "Permission already assigned to role." });
        }

        // Add permission to role
        role.permissions.push(permissionId);
        await role.save();

        // Populate the updated role with permission details
        const populatedRole = await Role.findById(roleId)
            .populate({
                path: 'permissions',
                select: 'permissionName description'
            });
        return res.status(200).json({ success: true, message: "Permission added to role successfully!", role: populatedRole });
    } catch (error) {
        console.error("Error adding permission to role", error);
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_ADDING_PERMISSION_TO_ROLE' });
    }
};

//desc Remove a permission from a role
//route DELETE /roles/:id/permissions/:permissionId
//access Private (requires Role: Admin and Permission: role:remove_permission)
export const removePermissionFromRole = async (req, res) => {
    const { id: roleId, permissionId } = req.params;
    try {
        //validation for roleId and permissionId
        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({ success: false, message: "Invalid role ID." });
        }
        if (!mongoose.Types.ObjectId.isValid(permissionId)) {
            return res.status(400).json({ success: false, message: "Invalid permission ID." });
        }

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found." });
        }

        // Check if permission exists in the permissions collection
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            return res.status(404).json({ success: false, message: "Permission not found." });
        }

        // check if permission is assigned to role
        if (!role.permissions.includes(permissionId)) {
            return res.status(400).json({ success: false, message: "Permission not assigned to role." });
        }

        //remove permission from role
        role.permissions = role.permissions.filter((permId) => permId.toString() !== permissionId.toString());
        if (role.permissions.length === 0) {
            console.warn(`Role '${role.roleName}' has no permissions assigned after removing permission '${permission.permissionName}'. Consider assigning at least one permission to this role.`);
        }

        await role.save();

        // Populate the updated role with permission details
        const populatedRole = await Role.findById(roleId)
            .populate({
                path: 'permissions',
                select: 'permissionName description'
            });
        return res.status(200).json({ success: true, message: "Permission removed from role successfully!", role: populatedRole });
    } catch (error) {
        console.error("Error removing permission from role", error);
        return res.status(500).json({ success: false, message: 'SERVER_ERROR_REMOVING_PERMISSION_FROM_ROLE' });
    }
};
