
import * as validatesRepository from "./validates.repository";
import { CreateValidateDto, UpdateValidateDto } from "./validates.schema";

export function getAllValidates() {
    return validatesRepository.findAll();
}

export function getValidateById(id: number) {
    return validatesRepository.findById(id);
}

export function addValidate(data: CreateValidateDto) {
    return validatesRepository.create(data);
}

export function updateValidate(id: number, data: UpdateValidateDto) {
    return validatesRepository.update(id, data);
}

export function deleteValidate(id: number) {
    return validatesRepository.deleteById(id);
}