import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Permission } from '../models/Permission.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';

dotenv.config();

const permissionsData = [
    { permissionName: 'permission:create', description: 'Create new permissions' },
    { permissionName: 'permission:read', description: 'View permissions' },
    { permissionName: 'permission:update', description: 'Update permissions' },
    { permissionName: 'permission:delete', description: 'Delete permissions' },
    { permissionName: 'user:manage', description: 'Manage all users' },
    { permissionName: 'budget:view', description: 'View own budget' },
    { permissionName: 'budget:edit', description: 'Edit own budget' }
];

const seedDB = async () => {
    let session;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB. Starting fresh seed...");

        // 1. Clear everything
        await Permission.deleteMany({});
        await Role.deleteMany({});
        await User.deleteMany({});
        console.log("🗑️ Database cleared.");

        // 2. Create Permissions
        const createdPermissions = await Permission.insertMany(permissionsData);
        console.log(`✅ ${createdPermissions.length} Permissions created.`);

        // 3. Create Roles
        const adminRole = new Role({
            roleName: 'Admin', // Capitalized to match your middleware tests
            description: 'System Administrator with full access',
            permissions: createdPermissions.map(p => p._id)
        });

        const userRole = new Role({
            roleName: 'User',
            description: 'Standard application user',
            permissions: createdPermissions
                .filter(p => p.permissionName.includes('budget'))
                .map(p => p._id)
        });

        await adminRole.save();
        await userRole.save();
        console.log("✅ Roles 'Admin' and 'User' created.");

        // 4. Create the Admin User
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'Kid',
            userName: 'koddix',
            email: 'admin@mail.com',
            password: 'admin123', // Your User model pre-save hook will hash this
            role: adminRole._id
        });

        await adminUser.save();
        console.log("👑 Admin User 'koddix' created and linked to Admin Role.");

        console.log("✨ Seeding completed successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();