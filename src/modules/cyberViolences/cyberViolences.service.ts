
import * as cyberViolencesRepository from "./cyberViolences.repository";
import { CreateCyberViolenceDto, UpdateCyberViolenceDto } from "./cyberViolences.schema";

export function getAllCyberViolences() {
    return cyberViolencesRepository.findAll();
}

export function getCyberViolenceById(id: number) {
    return cyberViolencesRepository.findById(id);
}

export function addCyberViolence(data: CreateCyberViolenceDto) {
    return cyberViolencesRepository.create(data);
}

export function updateCyberViolence(id: number, data: UpdateCyberViolenceDto) {
    return cyberViolencesRepository.update(id, data);
}

export function deleteCyberViolence(id: number) {
    return cyberViolencesRepository.deleteById(id);
}