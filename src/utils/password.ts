import { randomInt } from "node:crypto"

export function generatePassword(): string {
    const chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*"
    return Array.from(
        {length:8},
        ()=>
    chars[randomInt(chars.length)]).join("");
}