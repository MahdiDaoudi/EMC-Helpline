import { Request, Response } from "express";
import * as userService from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./users.schema";

export async function getUsers(req: Request, res: Response) {
    const users = await userService.getUsers();
    res.json(users);
}

export async function getUser(req: Request<{ id: string }>, res: Response) {
    const user = await userService.getUser(Number(req.params.id));
    res.json(user);
}

export async function createUser(
    req: Request<{}, {}, CreateUserDto>,
    res: Response
) {
    const result = await userService.addUser(req.body);
    res.status(201).json(result);
}

export async function updateUser(
    req: Request<{ id: string }, {}, UpdateUserDto>,
    res: Response
) {
    const user = await userService.editUser(Number(req.params.id), req.body);
    res.json(user);
}

export async function deleteUser(
    req: Request<{ id: string }>,
    res: Response
) {
    await userService.deleteUser(Number(req.params.id));
    res.status(204).send();
}