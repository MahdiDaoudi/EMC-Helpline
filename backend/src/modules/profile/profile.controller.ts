import { Request, Response } from "express";
import * as profileService from "./profile.service";
import { ChangePasswordDto } from "./profile.schema";
import { uploadProfileAvatar } from "../../services/supabaseStorage.service";

export async function getProfile(req: Request, res: Response) {
  const result = await profileService.getProfile(req.user.userId);
  res.json(result);
}

export async function updateProfile(req: Request, res: Response) {
  // req.body is already validated by validate(profileUpdateSchema)
  const payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string | null;
  } = { ...req.body };

  // If a new image file was uploaded, upload it and override profileImageUrl
  if ((req as any).file) {
    const uploadResult = await uploadProfileAvatar((req as any).file);
    payload.profileImageUrl = uploadResult.persistedReference ?? uploadResult.imageUrl;
  }

  const result = await profileService.updateProfile(req.user.userId, payload);
  res.json(result);
}

export async function changePassword(
  req: Request<{}, {}, ChangePasswordDto>,
  res: Response,
) {
  await profileService.changePassword(req.user.userId, req.body);
  res.status(200).json({ message: "Mot de passe modifié avec succès." });
}
