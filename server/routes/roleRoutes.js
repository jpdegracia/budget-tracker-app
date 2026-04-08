import express from 'express';
import { verifyToken, permissionAuthorization, roleAuthorization } from '../middleware/authmiddleware.js';
import { addPermissionToRole, createRole, deleteRole, getAllRoles, getRoleById, removePermissionFromRole, updateRole } from '../controllers/roles-controller.js';



const router = express.Router();

//routes for roles
router.post('/', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:create'), createRole);
router.get('/', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:read_all'), getAllRoles);
router.get('/:id', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:read'), getRoleById);
router.put('/:id', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:update'), updateRole);
router.delete('/:id', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:delete'), deleteRole);

//routes for role permissions (add/remove permissions to/from a role)
router.post('/:id/permissions', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:add_permission'), addPermissionToRole);
router.delete('/:id/permissions/:permissionId', verifyToken, roleAuthorization('Admin'), permissionAuthorization('role:remove_permission'), removePermissionFromRole);

export default router;