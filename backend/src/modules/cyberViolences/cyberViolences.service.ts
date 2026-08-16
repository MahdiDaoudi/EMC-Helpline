import { ApiError } from "../../utils/ApiError";
import * as cyberViolencesRepository from "./cyberViolences.repository";
import {
  CreateCyberViolenceDto,
  UpdateCyberViolenceDto,
} from "./cyberViolences.schema";

export function getAllCyberViolences() {
  return cyberViolencesRepository.findAll();
}

export function getCyberViolenceById(id: number) {
  return requireCyberViolence(id)
}

export async function addCyberViolence(data: CreateCyberViolenceDto) {
  const cyberViolence = await cyberViolencesRepository.findByName(data.name);
  if (cyberViolence) {
    throw new ApiError(409, "CyberViolence already exists");
  }
  return cyberViolencesRepository.create(data);
}

export async function updateCyberViolence(
  id: number,
  data: UpdateCyberViolenceDto,
) {
  await requireCyberViolence(id);
  const existing = await cyberViolencesRepository.findByName(data.name);
  if (existing && existing.id !== id) {
    throw new ApiError(409, "CyberViolence already exists");
  }

  return cyberViolencesRepository.update(id, data);
}

export async function deleteCyberViolence(id: number) {
  await requireCyberViolence(id);
  return cyberViolencesRepository.deleteById(id);
}


async function requireCyberViolence(id: number) {
  const cyberViolence = await cyberViolencesRepository.findById(id);

  if (!cyberViolence) {
    throw new ApiError(404, "CyberViolence not found");
  }

  return cyberViolence;
}