
import { ApiError } from "../../utils/ApiError";
import * as validatesRepository from "./validates.repository";
import { CreateValidateDto, UpdateValidateDto } from "./validates.schema";

export function getAllValidates() {
    return validatesRepository.findAll();
}

export async function getValidateById(signalementId: number, userId: number) {
    const validate = await validatesRepository.findById(signalementId,userId);
    if(!validate){
        throw new ApiError(404,"Validate not found.")
    }
}

export function addValidate(data: CreateValidateDto,signalementId: number, userId: number) {
    return validatesRepository.create(data,signalementId,userId);
}

export async function updateValidate(data: UpdateValidateDto,signalementId: number, userId: number) {
    await getValidateById(signalementId,userId)
    return validatesRepository.update(data,signalementId,userId);
}

export async function deleteValidate(signalementId: number, userId: number) {
    await getValidateById(signalementId,userId)
    return validatesRepository.deleteById(signalementId,userId);
}