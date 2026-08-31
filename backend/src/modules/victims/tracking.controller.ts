import { Request, Response } from 'express';
import * as trackingService from './tracking.service';
import { CreateSignalementDto } from '../signalements/signalements.schema';

export async function accessTracking(req: Request, res: Response) {
  try {
    const { referenceNumber, password } = req.body;
    const result = await trackingService.accessTracking(referenceNumber, password);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Erreur lors de l\'accès au suivi.',
    });
  }
}

export async function getVictimSignalements(req: Request, res: Response) {
  try {
    const victimId = req.victim!.victimId;
    const signalements = await trackingService.getVictimSignalements(victimId);
    return res.status(200).json(signalements);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Erreur lors de la récupération des signalements.',
    });
  }
}

export async function getVictimSignalementById(req: Request, res: Response) {
  try {
    const victimId = req.victim!.victimId;
    const signalementId = Number(req.params.id);
    if (!signalementId) {
      return res.status(400).json({ message: 'ID de signalement invalide.' });
    }

    const signalement = await trackingService.getVictimSignalementById(victimId, signalementId);
    return res.status(200).json(signalement);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Erreur lors de la récupération du signalement.',
    });
  }
}

export async function createVictimSignalement(req: Request, res: Response) {
  try {
    const victimId = req.victim!.victimId;
    const data = req.body as CreateSignalementDto;
    const files = (req.files as Express.Multer.File[]) ?? [];

    const signalement = await trackingService.createVictimSignalement(victimId, data, files);
    return res.status(201).json(signalement);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Erreur lors de la création du signalement.',
    });
  }
}

export async function logoutTracking(req: Request, res: Response) {
  return res.status(200).json({ message: 'Déconnexion du suivi réussie.' });
}
