import express from 'express';
import { verifyToken, PermissionAuthorization, roleAuthorization } from '../middleware/authmiddleware.js';
import { addPermissionToRole, createRole, deleteRole, getAllRoles, getRoleById, removePermissionFromRole, updateRole } from '../controllers/roles-controller.js';



const router = express.Router();

//routes for roles
router.post('/', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:create'), createRole);
router.get('/', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:read_all'), getAllRoles);
router.get('/:id', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:read'), getRoleById);
router.put('/:id', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:update'), updateRole);
router.delete('/:id', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:delete'), deleteRole);

//routes for role permissions (add/remove permissions to/from a role)
router.post('/:id/permissions', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:add_permission'), addPermissionToRole);
router.delete('/:id/permissions/:permissionId', verifyToken, roleAuthorization('admin'), PermissionAuthorization('role:remove_permission'), removePermissionFromRole);

export default router;