import mongoose from 'mongoose';
import { Permission } from '../models/Permission.js';
import { Role } from '../models/Role.js';


//@desc Create a Permission
//route POST /permissions
//access Private(requires Role: Admin and Permission: permission:create)
export const createPermission = async (req, res) => {
    const { permissionName, description } = req.body;
    let session;

    try {
        // 1. Basic Validation
        if (!permissionName || typeof permissionName !== 'string' || permissionName.trim() === '') {
            return res.status(400).json({ success: false, message: 'Valid permission name is required.' });
        }

        const normalizedName = permissionName.toLowerCase().trim();

        // --- Start Transaction ---
        session = await mongoose.startSession();
        session.startTransaction();

        // 2. Check for existence (inside session)
        const existingPermission = await Permission.findOne({ permissionName: normalizedName }).session(session);
        if (existingPermission) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Permission '${permissionName}' already exists.` });
        }

        // 3. Create the Permission (inside session)
        const newPermission = new Permission({
            permissionName: normalizedName,
            description: description || ''
        });
        const savedPermission = await newPermission.save({ session });

        // 4. Find Admin Role and link the new Permission (inside session)
        const adminRole = await Role.findOne({ roleName: 'Admin' }).session(session);

        if (adminRole) {
            adminRole.permissions.addToSet(savedPermission._id);
            await adminRole.save({ session });
        }

        // --- Success: Commit all changes ---
        await session.commitTransaction();

        return res.status(201).json({ 
            success: true, 
            message: 'Permission created and assigned to Admin.',
            permission: savedPermission 
        });

    } catch (error) {
        if (session) await session.abortTransaction();
        
        console.error("Error in createPermission:", error);
        return res.status(500).json({ success: false, message: "Server error creating permission." });
    } finally {
        if (session) session.endSession();
    }
};


//desc Get all Permissions
//route GET /permissions
//access Private (requires Role: Admin and Permission: permission:read_all)
export const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find({});
        return res.status(200).json({ 
            success: true, 
            count: permissions.length,
            permissions
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error while fetching permission'});
    }
}

//desc Get Permission by ID
//route GET /permissions/:id
//access Private (requires Role: Admin and Permission: permission:read)
export const getPermissionById = async (req, res) => {
    const { id: permissionId } = req.params;
    
    try {
        //validation if it exist and valid mongoose Object Id
        if (!mongoose.Types.ObjectId.isValid(permissionId)) {
            return res.status(400).json({ success: false, message: 'Invalid Permission ID format.'});
        }
        
        //checking of existing permission
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            return res.status(400).json({ success: false, message: 'Permission not Found.'});
        }

        res.status(200).json({ success: true, permission});
    } catch (error) {
        console.error("Error fetching permission ID", error);
        return res.status(500).json({ success: false, message: 'Server Error in fetching permission data.'});
    }
};


//desc Update Permission
//route PUT /permission/:id
//access Private (requires Role: Admin and Permission: permission:update)
export const updatePermission = async (req, res) => {
    const { id: permissionId } = req.params;
    const { permissionName, description } = req.body;

    try {
        //validation for permissions
        if (!mongoose.Types.ObjectId.isValid(permissionId)) {
            return res.status(400).json({ success: false, message: 'Invalid Permission ID format.'});
        }

        //validation for permission Name
        if (!permissionName || typeof permissionName === 'string' || permissionName.trim() === '') {
            return res.status(400).json({ success: false, message: `Permission with name '${permissionName} already exists`});
        }

        const normalizedName = permissionName.toLowerCase().trim();

        // check for existing permission
        const existingPermission = await Permission.findOne({ permissionName: normalizedName }).session(session);
        if (existingPermission) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Permission '${permissionName}' already exists.` });
        }

        // updating permission 
        const updatedPermission = await Permission.findByIdAndUpdate(
            permissionId,
            {
                permissionName: normalizedName,
                description
            },
            { new: true, runValidators: true}
        );

        if (!updatedPermission) {
            return res.status(404).json({ success: false, message: 'Permission not Found' });
        }
        res.status(200).json({
            success: true,
            message: 'Permission updated successfully.',
            permission: updatedPermission
        });

    } catch (error) {
        console.error('Error updating permission:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: `Validation failed: ${errors.join(', ')}` });
        }
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A permission with that name already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error while updating permission.' });
    }
}



//desc Delete Permission
//route DELETE /permission/:id
//access Private (requires Role: Admin and Permission: permission:delete)
export const deletePermission = async (req, res) => {
    const { id: permissionId } = req.params;
    try {
        // --- 1. Input Validation ---
        if (!mongoose.Types.ObjectId.isValid(permissionId)) {
            return res.status(400).json({ success: false, message: 'Invalid Permission ID format.' });
        }

        const permissionToDelete = await Permission.findById(permissionId);

        if (!permissionToDelete) {
            return res.status(404).json({ success: false, message: 'Permission not found.' });
        }

        const rolesWithPermission = await Role.find({ permissions: permissionId });
        const isAssignedToAdmin = rolesWithPermission.some(role => role.roleName === 'admin');

        if (isAssignedToAdmin) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete permission '${permissionToDelete.name}'. It is assigned to the 'admin' role and cannot be removed directly.`
            });
        }

        if (rolesWithPermission.length > 0) {
            const roleNames = rolesWithPermission.map(role => role.name).join(', ');
            return res.status(400).json({
                success: false,
                message: `Cannot delete permission '${permissionToDelete.name}'. It is currently assigned to role(s): ${roleNames}. Please remove it from all roles first.`
            });
        }


        // --- 2. Delete the Permission Document ---
        await permissionToDelete.deleteOne();

        res.status(200).json({ success: true, message: 'Permission deleted successfully.' });
    } catch (error) {
        console.error('Error deleting permission:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting permission.' });
    }
}