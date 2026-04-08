import express from "express";
import { verifyToken, PermissionAuthorization, roleAuthorization} from "../middleware/authmiddleware";


const router = express.Router();

//routes
router.post('/', verifyToken, roleAuthorization('admin'), PermissionAuthorization('permission:create'), createPermission);
router.get('/', verifyToken, roleAuthorization('admin'), PermissionAuthorization('permission:read_all'), getAllPermissions);
router.get('/:id', verifyToken, roleAuthorization('admin'), PermissionAuthorization('permission:read'), getPermissionById);
router.put('/:id', verifyToken, roleAuthorization('admin'), PermissionAuthorization('permission:update'), updatePermission);
router.delete('/:id', verifyToken, roleAuthorization('admin'), PermissionAuthorization('permission:delete'), deletePermission);

export default router;