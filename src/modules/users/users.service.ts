import bcrypt from "bcrypt";
import { generatePassword } from "../../utils/password";
import * as userRepository from "./users.repository";
import { CreateUserDto, UpdateUserDto } from "./users.schema";

export function getUsers() {
  return userRepository.findAll();
}

export function getUser(id: number) {
  return userRepository.findById(id);
}

export function editUser(id: number, user: UpdateUserDto) {
  return userRepository.update(id, user);
}

export async function addUser(user: CreateUserDto) {
  const generatedPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);
  const newUser = userRepository.create(user, hashedPassword);
  return {
    user: newUser,
    password: generatedPassword,
  };
}

export function deleteUser(id: number) {
  return userRepository.deleteById(id);
}
