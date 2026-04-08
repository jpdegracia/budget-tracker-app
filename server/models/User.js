import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        unique: true,
    },
    lastName: {
        type: String,
        default: ""
    },
    userName: {
        type: String,
        require: true,
        unique: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: [true, 'Role is required']
    },
    password: {
        type: String,
        require: function () {
            return !this.authProvider === 'local';
        }
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    authProvider: {
        type: String,
        enum: ['google', 'facebook', 'local'],
        default: 'local'
    },
    oauthId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: String
    }

}, {timestamps: true})


//pre-saving & hashing of password

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw(error); // Pass the error to Mongoose
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema)