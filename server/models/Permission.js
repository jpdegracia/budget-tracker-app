import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    permissionName: {
        type: String,
        required: [true, "Permission name is required"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    }
}, {timestamps: true});

export const Permission = mongoose.model("Permission", permissionSchema);