
import * as organizationsRepository from "./organizations.repository";
import { CreateOrganizationDto, UpdateOrganizationDto } from "./organizations.schema";

export function getAllOrganizations() {
    return organizationsRepository.findAll();
}

export function getOrganizationById(id: number) {
    return organizationsRepository.findById(id);
}

export function addOrganization(data: CreateOrganizationDto) {
    return organizationsRepository.create(data);
}

export function updateOrganization(id: number, data: UpdateOrganizationDto) {
    return organizationsRepository.update(id, data);
}

export function deleteOrganization(id: number) {
    return organizationsRepository.deleteById(id);
}