import { Request, Response } from "express";
import * as victimsService from "./victims.service";
import { CreatevictimDto, UpdatevictimDto } from "./victims.schema";

export async function getvictims(req: Request, res: Response) {
  const result = await victimsService.getAllvictims();
  res.json(result);
}

export async function getvictim(req: Request<{ id: string }>, res: Response) {
  const result = await victimsService.getvictimById(Number(req.params.id));
  res.json(result);
}

export async function updatevictim(
  req: Request<{ id: string }, {}, UpdatevictimDto>,
  res: Response,
) {
  const result = await victimsService.updatevictim(
    Number(req.params.id),
    req.body,
  );
  res.json(result);
}

export async function deletevictim(
  req: Request<{ id: string }>,
  res: Response,
) {
  await victimsService.deletevictim(Number(req.params.id));
  res.status(204).send();
}
