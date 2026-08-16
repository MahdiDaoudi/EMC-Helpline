import { ApiError } from "../../utils/ApiError";
import * as platformsRepository from "./platforms.repository";
import { CreatePlatformDto, UpdatePlatformDto } from "./platforms.schema";
import { prisma } from "../../config/prisma";
import {
  createSignedUrl,
  deleteUploadedScreenshot,
} from "../../services/supabaseStorage.service";

export function getAllPlatforms() {
  return resolvePlatformIcons(platformsRepository.findAll());
}

export function getPlatformById(id: number) {
  return requirePlatform(id).then(async (p) => {
    // ensure icon is a usable URL when possible
    if (p?.icon && String(p.icon).startsWith("supabase://")) {
      try {
        const ref = String(p.icon).replace("supabase://", "");
        const parts = ref.split("/");
        // first part is bucket, remaining is path
        parts.shift();
        const storagePath = parts.join("/");
        const signed = await createSignedUrl(storagePath);
        return { ...p, icon: signed ?? p.icon };
      } catch (err) {
        return p;
      }
    }
    return p;
  });
}

async function resolvePlatformIcons(promiseOrArray: Promise<any> | any) {
  const items = Array.isArray(promiseOrArray)
    ? promiseOrArray
    : await promiseOrArray;
  const resolved = await Promise.all(
    items.map(async (p: any) => {
      if (p?.icon && String(p.icon).startsWith("supabase://")) {
        try {
          const ref = String(p.icon).replace("supabase://", "");
          const parts = ref.split("/");
          parts.shift();
          const storagePath = parts.join("/");
          const signed = await createSignedUrl(storagePath);
          return { ...p, icon: signed ?? p.icon };
        } catch (err) {
          return p;
        }
      }
      return p;
    }),
  );

  return resolved;
}

export async function addPlatform(data: CreatePlatformDto) {
  const existing = await platformsRepository.findByName(data.name);
  if (existing) {
    throw new ApiError(409, "Une plateforme avec ce nom existe déjà.");
  }
  try {
    return platformsRepository.create(data);
  } catch (err: any) {
    if (err?.code === "P2002" && err?.meta?.target) {
      const target = String(err.meta.target);
      if (target.includes("email")) {
        throw new ApiError(409, "Une plateforme avec cet email existe déjà.");
      }
      if (target.includes("name")) {
        throw new ApiError(409, "Une plateforme avec ce nom existe déjà.");
      }
    }
    throw err;
  }
}

export async function updatePlatform(id: number, data: UpdatePlatformDto) {
  await requirePlatform(id);
  if (data.name) {
    const existing = await platformsRepository.findByName(data.name);
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Une plateforme avec ce nom existe déjà.");
    }
  }
  try {
    // If the client explicitly cleared the icon (sent null), delete the stored file if any
    if (
      Object.prototype.hasOwnProperty.call(data, "icon") &&
      data.icon === null
    ) {
      const current = await platformsRepository.findById(id);
      if (current?.icon && String(current.icon).startsWith("supabase://")) {
        try {
          // stored format: supabase://{bucket}/{storagePath}
          const ref = String(current.icon).replace("supabase://", "");
          const parts = ref.split("/");
          // remove bucket
          parts.shift();
          const storagePath = parts.join("/");
          await deleteUploadedScreenshot(storagePath);
        } catch (err) {
          // log and continue; don't block the update if delete fails
          console.error("Failed to delete platform icon from storage:", err);
        }
      }
    }

    return platformsRepository.update(id, data);
  } catch (err: any) {
    if (err?.code === "P2002" && err?.meta?.target) {
      const target = String(err.meta.target);
      if (target.includes("email")) {
        throw new ApiError(409, "Une plateforme avec cet email existe déjà.");
      }
      if (target.includes("name")) {
        throw new ApiError(409, "Une plateforme avec ce nom existe déjà.");
      }
    }
    throw err;
  }
}

export async function deletePlatform(id: number) {
  await requirePlatform(id);

  // Prevent deletion if platform is referenced by reported items or platform reports
  const [reportedCount, reportCount] = await Promise.all([
    prisma.reportedItem.count({ where: { platformId: id } }),
    prisma.platformReport.count({ where: { platformId: id } }),
  ]);

  if (reportedCount > 0 || reportCount > 0) {
    throw new ApiError(
      400,
      "Cette plateforme possède des données associées et ne peut pas être supprimée.",
    );
  }

  return platformsRepository.deleteById(id);
}

async function requirePlatform(id: number) {
  const platform = await platformsRepository.findById(id);
  if (!platform) {
    throw new ApiError(404, "Platform not found.");
  }
  return platform;
}
