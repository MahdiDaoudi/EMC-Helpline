import { prisma } from "../../config/prisma";
import { CreateCyberViolenceDto, UpdateCyberViolenceDto } from "./cyberViolences.schema";

export function findAll() {
    return prisma.cyberViolence.findMany()
}

export function findById(id: number) {
    return prisma.cyberViolence.findUnique({
        where:{id}
    })
}

export function findByName(name: string) {
    return prisma.cyberViolence.findUnique({
        where:{name}
    })
}

export function create(data: CreateCyberViolenceDto) {
    return prisma.cyberViolence.create({
        data
    })
}

export function update(id: number, data: UpdateCyberViolenceDto) {
    return prisma.cyberViolence.update({
        where:{id},
        data
    })
}

export function deleteById(id: number) {
    return prisma.cyberViolence.delete({
        where:{id}
    })
}

