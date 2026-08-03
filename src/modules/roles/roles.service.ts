import { ApiError } from '../../utils/ApiError';
import * as roleRepository from './roles.repository'
import { CreateRoleDto, UpdateRoleDto } from './roles.schema'

export function getAllRoles() {
    return roleRepository.findAll()
}

export function getRoleById(id: number) {
    return roleRepository.findById(id)
}

export async function addRole(data: CreateRoleDto) {
    const existingRole = await roleRepository.findByName(data.name);
    if(existingRole){
        throw new ApiError(409,"Role already exists")
    }
    return roleRepository.create(data)
}

export async function updateRole(id: number, data: UpdateRoleDto){
    if (data.name) {
        const existingRole = await roleRepository.findByName(data.name);

        if (existingRole && existingRole.id !== id) {
            throw new ApiError(409, "Role already exists");
        }
    }
    return roleRepository.update(id,data)
}

export function deleteRole(id: number){
    return roleRepository.deleteById(id)
}