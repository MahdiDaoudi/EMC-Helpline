import { Request, Response } from "express";
import * as assignedTosService from "./assignedTos.service";
import { UpdateAssignedToDto } from "./assignedTos.schema";

export async function getAssignedTos(req: Request, res: Response) {
  const result = await assignedTosService.getAllAssignedTos();
  res.json(result);
}

export async function getAssignedTo(
  req: Request<{ signalementId: string; organizationId: string }>,
  res: Response,
) {
  const result = await assignedTosService.getAssignedToById(
    Number(req.params.signalementId),
    Number(req.params.organizationId),
  );
  res.json(result);
}

export async function createAssignedTo(
  req: Request<
    {},
    {},
    {
      signalementId: number;
      organizationId: number;
      type?: string;
      status?: string;
      reason?: string;
    }
  >,
  res: Response,
) {
  const result = await assignedTosService.addAssignedTo(
    Number(req.body.signalementId),
    Number(req.body.organizationId),
    req.body.type as any,
  );

  if (req.body.reason || req.body.status) {
    const updated = await assignedTosService.updateAssignedTo(
      {
        status: req.body.status as any,
        reason: req.body.reason,
      },
      Number(req.body.signalementId),
      Number(req.body.organizationId),
    );
    res.status(201).json(updated);
    return;
  }

  res.status(201).json(result);
}

export async function updateAssignedTo(
  req: Request<
    { signalementId: string; organizationId: string },
    {},
    UpdateAssignedToDto
  >,
  res: Response,
) {
  const result = await assignedTosService.updateAssignedTo(
    req.body,
    Number(req.params.signalementId),
    Number(req.params.organizationId),
  );
  res.json(result);
}

export async function deleteAssignedTo(
  req: Request<{ signalementId: string; organizationId: string }>,
  res: Response,
) {
  await assignedTosService.deleteAssignedTo(
    Number(req.params.signalementId),
    Number(req.params.organizationId),
  );
  res.status(204).send();
}
