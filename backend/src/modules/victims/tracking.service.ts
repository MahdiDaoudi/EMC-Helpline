import { prisma } from "../../config/prisma";
import { verifyPassword } from "../../utils/password";
import { generateVictimToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { CreateSignalementDto } from "../signalements/signalements.schema";
import { addSignalement } from "../signalements/signalements.service";
import { createSignedUrl } from "../../services/supabaseStorage.service";

// ─────────────────────────────────────────────────────────────────────────────
// Shared select shape used for both list and detail queries
// ─────────────────────────────────────────────────────────────────────────────
const victimSignalementSelect = {
  id: true,
  description: true,
  status: true,
  createdAt: true,
  cyberViolence: {
    select: {
      id: true,
      name: true,
    },
  },
  assignedTo: {
    select: {
      type: true,
      status: true,
      organization: {
        select: {
          nickname: true,
          name: true,
        },
      },
    },
  },
  validate: {
    select: {
      status: true,
      reason: true,
      createdAt: true,
    },
  },
  reportedItems: {
    select: {
      id: true,
      contentUrl: true,
      type: true,
      platform: {
        select: {
          name: true,
        },
      },
      screenshots: {
        select: {
          id: true,
          imageUrl: true,
          storagePath: true, // needed to sign URL, stripped before sending
        },
      },
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sign screenshot URLs and strip internal storagePath from response
// ─────────────────────────────────────────────────────────────────────────────
async function enrichSignalement<
  T extends {
    id: number;
    reportedItems?: Array<{
      screenshots?: Array<{ id: number; imageUrl: string; storagePath?: string | null }>;
    }>;
  },
>(
  signalement: T | null,
): Promise<(Omit<T, "reportedItems"> & {
  reference: string;
  reportedItems: Array<{
    id: number;
    contentUrl: string;
    type: string;
    platform: { name: string } | null;
    screenshots: Array<{ id: number; imageUrl: string }>;
  }>;
}) | null> {
  if (!signalement) return null;

  const cleanedItems = await Promise.all(
    (signalement.reportedItems ?? []).map(async (item) => {
      const screenshots = await Promise.all(
        (item.screenshots ?? []).map(async (s) => {
          let imageUrl = s.imageUrl;
          if (s.storagePath) {
            const signed = await createSignedUrl(s.storagePath);
            if (signed) imageUrl = signed;
          }
          // Return only public-safe fields (no storagePath)
          return { id: s.id, imageUrl };
        }),
      );
      // Return only public-safe fields
      return {
        id: (item as any).id,
        contentUrl: (item as any).contentUrl,
        type: (item as any).type,
        platform: (item as any).platform ?? null,
        screenshots,
      };
    }),
  );

  const { reportedItems: _removed, ...rest } = signalement as any;

  return {
    ...rest,
    reference: `SIG-${signalement.id}`,
    reportedItems: cleanedItems,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export async function accessTracking(referenceNumber: string, password: string) {
  if (!referenceNumber?.trim() || !password?.trim()) {
    throw new ApiError(400, "Numéro de référence et mot de passe requis.");
  }

  const cleanRef = referenceNumber.trim().toUpperCase();

  const victim = await prisma.victim.findUnique({
    where: { referenceNumber: cleanRef },
    select: {
      id: true,
      referenceNumber: true,
      hashedPassword: true,
    },
  });

  if (!victim || !victim.hashedPassword) {
    throw new ApiError(401, "Numéro de référence ou mot de passe incorrect.");
  }

  const isPasswordValid = await verifyPassword(password, victim.hashedPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Numéro de référence ou mot de passe incorrect.");
  }

  const token = generateVictimToken(victim.id, victim.referenceNumber);

  return {
    token,
    referenceNumber: victim.referenceNumber,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────────────────────
export async function getVictimSignalements(victimId: number) {
  const signalements = await prisma.signalement.findMany({
    where: { victimId },
    orderBy: { createdAt: "desc" },
    select: victimSignalementSelect,
  });

  const enriched = await Promise.all(
    signalements.map((s) => enrichSignalement(s)),
  );

  return enriched.filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail
// ─────────────────────────────────────────────────────────────────────────────
export async function getVictimSignalementById(victimId: number, signalementId: number) {
  const signalement = await prisma.signalement.findFirst({
    where: {
      id: signalementId,
      victimId: victimId,
    },
    select: victimSignalementSelect,
  });

  if (!signalement) {
    throw new ApiError(404, "Signalement introuvable.");
  }

  return enrichSignalement(signalement);
}

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────
export async function createVictimSignalement(
  victimId: number,
  data: CreateSignalementDto,
  files: Express.Multer.File[] = [],
) {
  const payload: CreateSignalementDto = {
    ...data,
    victimId: victimId,
    victim: undefined,
  };

  return addSignalement(payload, undefined, files, "PUBLIC");
}
