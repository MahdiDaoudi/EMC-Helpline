import { ApiError } from '../../utils/ApiError';
import * as roleRepository from './roles.repository';
import { CreateRoleDto, UpdateRoleDto } from './roles.schema';
import { prisma } from '../../config/prisma';

export function getAllRoles() {
    return roleRepository.findAll();
}

export function getRoleById(id: number) {
    return roleRepository.findById(id);
}

export async function addRole(data: CreateRoleDto) {
    const existingRole = await roleRepository.findByName(data.name);
    if (existingRole) {
        throw new ApiError(409, "Un rôle avec ce nom existe déjà.");
    }
    return roleRepository.create(data);
}

export async function updateRole(id: number, data: UpdateRoleDto) {
    if (data.name) {
        const existingRole = await roleRepository.findByName(data.name);

        if (existingRole && existingRole.id !== id) {
            throw new ApiError(409, "Un rôle avec ce nom existe déjà.");
        }
    }
    return roleRepository.update(id, data);
}

export async function deleteRole(id: number) {
    const role = await roleRepository.findById(id);
    if (!role) {
        throw new ApiError(404, "Rôle introuvable.");
    }

    const userCount = await prisma.user.count({
        where: { roleId: id },
    });

    if (userCount > 0) {
        throw new ApiError(
            400,
            "Ce rôle est utilisé par des utilisateurs et ne peut pas être supprimé."
        );
    }

    return roleRepository.deleteById(id);
}