import { Request, Response } from "express";
import * as profileService from "./profile.service";
import { ChangePasswordDto, ProfileUpdateDto } from "./profile.schema";

export async function getProfile(req: Request, res: Response) {
  const result = await profileService.getProfile(req.user.userId);
  res.json(result);
}

export async function updateProfile(
  req: Request<{}, {}, ProfileUpdateDto>,
  res: Response,
) {
  const result = await profileService.updateProfile(req.user.userId, req.body);
  res.json(result);
}

export async function changePassword(
  req: Request<{}, {}, ChangePasswordDto>,
  res: Response,
) {
  await profileService.changePassword(req.user.userId, req.body);
  res.status(200).json({ message: "Mot de passe modifié avec succès." });
}
