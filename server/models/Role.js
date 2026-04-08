import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: [true, "Role name is required"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    permissions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
        required: [true, "Permissions are required"],
    }
}, {timestamps: true});

export const Role = mongoose.model("Role", roleSchema);