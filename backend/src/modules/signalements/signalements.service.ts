import { Priority, SignalementStatus } from "../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import {
  uploadScreenshotToSupabase,
  deleteUploadedScreenshot,
  createSignedUrl,
} from "../../services/supabaseStorage.service";
import * as signalementsRepository from "./signalements.repository";
import {
  CreateSignalementDto,
  UpdateSignalementDto,
} from "./signalements.schema";
import { generatePassword, hashPassword } from "../../utils/password";
import { randomBytes } from "crypto";
import * as victimRepository from "../victims/victims.repository";
import { ApiError } from "../../utils/ApiError";

function normalizeSignalementId(id: number | string) {
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid signalement id.");
  }

  return parsed;
}

async function withSignedScreenshotUrls<
  T extends {
    reportedItems?: Array<{
      screenshots?: Array<{ imageUrl: string; storagePath?: string | null }>;
    }>;
  },
>(signalement: T | null): Promise<T | null> {
  if (!signalement || !Array.isArray(signalement.reportedItems)) {
    return signalement;
  }

  for (const item of signalement.reportedItems) {
    if (!Array.isArray(item.screenshots)) continue;

    for (const screenshot of item.screenshots) {
      if (!screenshot || !screenshot.storagePath) continue;

      const signedUrl = await createSignedUrl(screenshot.storagePath);
      if (signedUrl) {
        screenshot.imageUrl = signedUrl;
      }
    }
  }

  return signalement;
}

export async function getAllSignalements(params?: {
  search?: string;
  status?: string;
  priority?: string;
  titulaire?: string;
  cyberViolenceId?: number;
  accompanimentType?: string;
  issuer?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, Number(params?.page ?? 1));
  const limit = Math.max(1, Number(params?.limit ?? 20));
  const [signalements, total] = await Promise.all([
    signalementsRepository.findAll({
      search: params?.search,
      status: params?.status,
      priority: params?.priority,
      titulaire: params?.titulaire,
      cyberViolenceId: params?.cyberViolenceId,
      accompanimentType: params?.accompanimentType,
      issuer: params?.issuer,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      page,
      limit,
    }),
    signalementsRepository.countAll({
      search: params?.search,
      status: params?.status,
      priority: params?.priority,
      titulaire: params?.titulaire,
      cyberViolenceId: params?.cyberViolenceId,
      accompanimentType: params?.accompanimentType,
      issuer: params?.issuer,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
    }),
  ]);

  const enriched = await Promise.all(
    signalements.map((signalement) => withSignedScreenshotUrls(signalement)),
  );

  return {
    items: enriched,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getSignalementById(id: number | string) {
  const signalement = await signalementsRepository.findById(
    normalizeSignalementId(id),
  );
  return withSignedScreenshotUrls(signalement);
}

async function resolveIssuerForUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
      organization: {
        select: {
          nickname: true,
        },
      },
    },
  });

  if (user?.organizationId === null) {
    return "EMC";
  }

  if (user?.organization?.nickname) {
    return user.organization.nickname;
  }

  return "EMC";
}

function normalizeTitulaire(value?: string): "MOI_MEME" | "AUTRE_PERSONNE" {
  if (value === "AUTRE_PERSONNE") return "AUTRE_PERSONNE";
  return "MOI_MEME";
}

function normalizeAccompanimentTypes(
  value?: string[],
): Array<"SUP" | "PSY" | "JUR"> {
  const valid = new Set(["SUP", "PSY", "JUR"] as const);
  const normalized = Array.from(
    new Set(
      (value ?? []).filter(
        (item): item is "SUP" | "PSY" | "JUR" =>
          Boolean(item) && valid.has(item as "SUP" | "PSY" | "JUR"),
      ),
    ),
  );

  if (!normalized.includes("SUP")) {
    normalized.unshift("SUP");
  }

  return normalized;
}

function groupFilesByScreenshotIndex(files: Express.Multer.File[]) {
  const groupedFiles = new Map<number, Express.Multer.File[]>();

  for (const file of files) {
    const match = file.fieldname.match(/^screenshots\[(\d+)\]$/);
    if (!match) continue;

    const index = Number(match[1]);
    const existing = groupedFiles.get(index) ?? [];
    existing.push(file);
    groupedFiles.set(index, existing);
  }

  return groupedFiles;
}

async function attachUploadedScreenshots(
  signalementId: number,
  payload: CreateSignalementDto,
  files: Express.Multer.File[],
) {
  const groupedFiles = groupFilesByScreenshotIndex(files);
  const uploadedScreenshotsByIndex = new Map<
    number,
    Array<{ imageUrl: string; storagePath: string; publicId: string | null }>
  >();
  const uploadedStoragePaths: string[] = [];

  if (groupedFiles.size === 0) {
    return { uploadedScreenshotsByIndex, uploadedStoragePaths };
  }

  for (const [index, fileList] of groupedFiles.entries()) {
    const screenshots = [] as Array<{
      imageUrl: string;
      storagePath: string;
      publicId: string | null;
    }>;

    for (const file of fileList) {
      if (!file.buffer || file.buffer.length === 0) {
        continue;
      }

      console.log("[PERF] FILE:", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        sizeMB: (file.size / 1024 / 1024).toFixed(2),
      });

      const result = await uploadScreenshotToSupabase(
        file,
        signalementId,
        index,
      );
      uploadedStoragePaths.push(result.storagePath);

      screenshots.push({
        imageUrl: result.imageUrl,
        storagePath: result.storagePath,
        publicId: null,
      });
    }

    if (payload.reportedItems[index]) {
      payload.reportedItems[index].screenshots = screenshots;
    }

    if (screenshots.length > 0) {
      uploadedScreenshotsByIndex.set(index, screenshots);
    }
  }

  return { uploadedScreenshotsByIndex, uploadedStoragePaths };
}

async function persistScreenshotsByReportedItem(
  signalementId: number,
  signalement: any,
  uploadedScreenshotsByIndex: Map<
    number,
    Array<{ imageUrl: string; storagePath: string; publicId: string | null }>
  >,
) {
  if (!signalement || !Array.isArray(signalement.reportedItems)) {
    return signalement;
  }

  for (const [index, screenshots] of uploadedScreenshotsByIndex.entries()) {
    const reportedItem = signalement.reportedItems[index];
    if (!reportedItem || screenshots.length === 0) continue;

    await prisma.screenshot.createMany({
      data: screenshots.map((screenshot) => ({
        reportedItemId: reportedItem.id,
        imageUrl: screenshot.imageUrl,
        storagePath: screenshot.storagePath,
        publicId: screenshot.publicId,
      })),
    });
  }

  return signalementsRepository.findById(signalementId);
}

export async function addSignalement(
  data: CreateSignalementDto,
  userId?: number,
  files: Express.Multer.File[] = [],
) {
  const issuer = userId ? await resolveIssuerForUser(userId) : "PUBLIC_FORM";
  const titulaire = normalizeTitulaire(data.titulaire);
  const accompanimentTypes = normalizeAccompanimentTypes(
    data.accompanimentTypes,
  );
  const payload = {
    ...data,
    titulaire,
    accompanimentTypes,
    reportedItems: data.reportedItems.map((item) => ({
      ...item,
      screenshots: [...(item.screenshots ?? [])],
    })),
  };

  if (payload.victimId) {
    const victim = await victimRepository.findById(payload.victimId);
    if (!victim) {
      throw new ApiError(404, "Victim not found.");
    }

    const signalement = await signalementsRepository.createWithExistingVictim(
      payload,
      {
        status: SignalementStatus.PENDING,
        priority: Priority.NORMAL,
        victimId: victim.id,
        issuer,
        titulaire,
        accompanimentTypes,
      },
    );

    const { uploadedScreenshotsByIndex } = await attachUploadedScreenshots(
      signalement.id,
      payload,
      files,
    );

    return persistScreenshotsByReportedItem(
      signalement.id,
      signalement,
      uploadedScreenshotsByIndex,
    );
  }

  if (!payload.victim) {
    throw new ApiError(
      400,
      "Victim payload is required when creating a new signalement.",
    );
  }

  const password = generatePassword();
  const hashedPassword = await hashPassword(password);
  const signalement = await signalementsRepository.createWithNewVictim(
    payload,
    {
      status: SignalementStatus.PENDING,
      priority: Priority.NORMAL,
      referenceNumber: randomBytes(4).toString("hex").toUpperCase(),
      hashedPassword: hashedPassword,
      isAnonymous: !payload.victim.firstName && !payload.victim.lastName,
      issuer,
      titulaire,
      accompanimentTypes,
    },
  );

  const { uploadedScreenshotsByIndex, uploadedStoragePaths } =
    await attachUploadedScreenshots(signalement.id, payload, files);

  try {
    const finalSignalement = await persistScreenshotsByReportedItem(
      signalement.id,
      signalement,
      uploadedScreenshotsByIndex,
    );

    return {
      ...finalSignalement,
      password,
    };
  } catch (error) {
    for (const storagePath of uploadedStoragePaths) {
      await deleteUploadedScreenshot(storagePath);
    }
    throw error;
  }
}

export function updateSignalement(
  id: number | string,
  data: UpdateSignalementDto,
) {
  return signalementsRepository.update(normalizeSignalementId(id), data);
}

export function deleteSignalement(id: number | string) {
  return signalementsRepository.deleteById(normalizeSignalementId(id));
}
