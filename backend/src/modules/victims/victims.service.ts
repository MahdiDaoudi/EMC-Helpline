import { ApiError } from "../../utils/ApiError";
import { generatePassword, hashPassword } from "../../utils/password";
import * as victimsRepository from "./victims.repository";
import { CreatevictimDto, UpdatevictimDto } from "./victims.schema";
import { randomBytes } from "crypto";

export function getAllvictims() {
  return victimsRepository.findAll();
}

export function getvictimById(id: number) {
  return requirevictim(id);
}

export function updatevictim(id: number, data: UpdatevictimDto) {
  return victimsRepository.update(id, data);
}

export function deletevictim(id: number) {
  return victimsRepository.deleteById(id);
}

async function requirevictim(id: number) {
  const victim = await victimsRepository.findById(id);
  if (!victim) {
    throw new ApiError(404, "victim not found");
  }
  return victim;
}
