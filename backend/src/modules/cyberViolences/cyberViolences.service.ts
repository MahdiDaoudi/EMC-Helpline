import { ApiError } from "../../utils/ApiError";
import * as cyberViolencesRepository from "./cyberViolences.repository";
import { prisma } from "../../config/prisma";
import {
  CreateCyberViolenceDto,
  UpdateCyberViolenceDto,
} from "./cyberViolences.schema";

export function getAllCyberViolences() {
  return cyberViolencesRepository.findAll();
}

export function getCyberViolenceById(id: number) {
  return requireCyberViolence(id);
}

export async function addCyberViolence(data: CreateCyberViolenceDto) {
  const cyberViolence = await cyberViolencesRepository.findByName(data.name);
  if (cyberViolence) {
    throw new ApiError(409, "Un type de cyberviolence avec ce nom existe déjà.");
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
    throw new ApiError(409, "Un type de cyberviolence avec ce nom existe déjà.");
  }

  return cyberViolencesRepository.update(id, data);
}

export async function deleteCyberViolence(id: number) {
  await requireCyberViolence(id);

  const count = await prisma.signalement.count({ where: { cyberViolenceId: id } });
  if (count > 0) {
    throw new ApiError(
      409,
      `Ce type de cyberviolence est associé à ${count} signalement${count > 1 ? "s" : ""} et ne peut pas être supprimé.`,
    );
  }

  return cyberViolencesRepository.deleteById(id);
}

async function requireCyberViolence(id: number) {
  const cyberViolence = await cyberViolencesRepository.findById(id);

  if (!cyberViolence) {
    throw new ApiError(404, "Type de cyberviolence introuvable.");
  }

  return cyberViolence;
}