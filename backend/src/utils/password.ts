import { randomInt } from "node:crypto"
import bcrypt from 'bcrypt'

export function generatePassword(): string {
    const chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*"
    return Array.from(
        {length:8},
        ()=>
    chars[randomInt(chars.length)]).join("");
}

export function hashPassword(password: string) {
    return bcrypt.hash(password,10);
}

export function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}