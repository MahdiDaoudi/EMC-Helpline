
import * as platformsRepository from "./platforms.repository";
import { CreatePlatformDto, UpdatePlatformDto } from "./platforms.schema";

export function getAllPlatforms() {
    return platformsRepository.findAll();
}

export function getPlatformById(id: number) {
    return platformsRepository.findById(id);
}

export function addPlatform(data: CreatePlatformDto) {
    return platformsRepository.create(data);
}

export function updatePlatform(id: number, data: UpdatePlatformDto) {
    return platformsRepository.update(id, data);
}

export function deletePlatform(id: number) {
    return platformsRepository.deleteById(id);
}