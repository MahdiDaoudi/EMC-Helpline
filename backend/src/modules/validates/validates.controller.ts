import { Request, Response } from "express";
import * as validatesService from "./validates.service";
import { CreateValidateDto, UpdateValidateDto } from "./validates.schema";

export async function getValidates(req: Request, res: Response) {
  const result = await validatesService.getAllValidates();
  res.json(result);
}

export async function getValidate(
  req: Request<{ signalementId: string; userId: string }>,
  res: Response,
) {
  const result = await validatesService.getValidateById(
    Number(req.params.signalementId),
    Number(req.params.userId),
  );
  res.json(result);
}

export async function createValidate(
  req: Request<
    { signalementId: string; userId: string },
    {},
    CreateValidateDto
  >,
  res: Response,
) {
  const result = await validatesService.addValidate(
    req.body,
    Number(req.params.signalementId),
    Number(req.params.userId),
  );
  res.status(201).json(result);
}

export async function updateValidate(
  req: Request<
    { signalementId: string; userId: string },
    {},
    UpdateValidateDto
  >,
  res: Response,
) {
  const result = await validatesService.updateValidate(
    req.body,
    Number(req.params.signalementId),
    Number(req.params.userId),
  );
  res.json(result);
}

export async function deleteValidate(
  req: Request<{ signalementId: string; userId: string }>,
  res: Response,
) {
  await validatesService.deleteValidate(
    Number(req.params.signalementId),
    Number(req.params.userId),
  );
  res.status(204).send();
}
