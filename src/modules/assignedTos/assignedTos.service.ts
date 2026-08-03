
import * as assignedTosRepository from "./assignedTos.repository";
import { CreateAssignedToDto, UpdateAssignedToDto } from "./assignedTos.schema";

export function getAllAssignedTos() {
    return assignedTosRepository.findAll();
}

export function getAssignedToById(id: number) {
    return assignedTosRepository.findById(id);
}

export function addAssignedTo(data: CreateAssignedToDto) {
    return assignedTosRepository.create(data);
}

export function updateAssignedTo(id: number, data: UpdateAssignedToDto) {
    return assignedTosRepository.update(id, data);
}

export function deleteAssignedTo(id: number) {
    return assignedTosRepository.deleteById(id);
}