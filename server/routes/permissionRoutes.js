import express from "express";
import { verifyToken, permissionAuthorization, roleAuthorization} from "../middleware/authmiddleware.js";
import { createPermission, getAllPermissions, getPermissionById, updatePermission, deletePermission} from '../controllers/permission-controller.js'

const router = express.Router();

//routes
router.post('/', verifyToken, roleAuthorization('Admin'), permissionAuthorization('permission:create'), createPermission);
router.get('/', verifyToken, roleAuthorization('Admin'), permissionAuthorization('permission:read_all'), getAllPermissions);
router.get('/:id', verifyToken, roleAuthorization('Admin'), permissionAuthorization('permission:read'), getPermissionById);
router.put('/:id', verifyToken, roleAuthorization('Admin'), permissionAuthorization('permission:update'), updatePermission);
router.delete('/:id', verifyToken, roleAuthorization('Admin'), permissionAuthorization('permission:delete'), deletePermission);

export default router;