import express from 'express';
import { loginUser, registerUser } from '../controllers/user-controller.js';

const router = express.Router();

// user auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
// router.post('/logout', logout);
// router.get('/profile', userProfile);
// router.put('/update-profile', userUpdateProfile);


// admin routes
// router.post('/create-user', createUser);
// router.get('/:id', getUserDetails);
// router.get('/all-users', getAllUsersDetails);
// router.put('/update-user/:id', updateUser);
// router.delete('/delete/:id', deleteUser);

export default router;