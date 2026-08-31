import { randomUUID } from "crypto";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";
import { supabase } from "../config/supabase";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function ensureSupabaseConfigured() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey || !env.supabaseBucket) {
    throw new ApiError(
      500,
      "Supabase storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_BUCKET.",
    );
  }

  if (!supabase) {
    throw new ApiError(500, "Supabase client is not available on the server.");
  }
}

export function validateScreenshotFile(file: Express.Multer.File) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new ApiError(400, "Invalid screenshot file.");
  }

  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new ApiError(
      400,
      "Unsupported screenshot type. Only JPEG, PNG and WEBP are allowed.",
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new ApiError(400, "Screenshot exceeds the 5MB limit.");
  }
}

function getFileExtension(mimetype: string) {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".bin";
  }
}

export async function createSignedUrl(
  storagePath: string | null,
  expiresIn = 3600,
) {
  if (!storagePath) {
    return null;
  }

  ensureSupabaseConfigured();

  try {
    const { data, error } = await supabase!.storage
      .from(env.supabaseBucket)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.error("[SUPABASE] SIGNED URL ERROR", {
        storagePath,
        message: error?.message,
      });
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("[SUPABASE] SIGNED URL EXCEPTION", {
      storagePath,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

export async function uploadScreenshotToSupabase(
  file: Express.Multer.File,
  signalementId: number,
  index: number,
) {
  validateScreenshotFile(file);
  ensureSupabaseConfigured();

  const storagePath = `signalements/${signalementId}/${randomUUID()}${getFileExtension(file.mimetype)}`;
  const startedAt = Date.now();


  try {
    const { data, error } = await supabase!.storage
      .from(env.supabaseBucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        cacheControl: "3600",
      });

    if (error || !data?.path) {
      throw new ApiError(
        500,
        `Supabase upload failed for ${file.originalname}: ${error?.message ?? "unknown error"}`,
      );
    }

    const duration = Date.now() - startedAt;

    const signedUrl = await createSignedUrl(storagePath);
    const persistedReference = `supabase://${env.supabaseBucket}/${storagePath}`;

    return {
      storagePath,
      imageUrl: signedUrl ?? persistedReference,
    };
  } catch (error) {
    console.error("[SUPABASE] Upload error", {
      filename: file.originalname,
      size: file.size,
      storagePath,
      duration: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

export async function deleteUploadedScreenshot(storagePath: string | null) {
  if (!storagePath) return;

  if (!supabase) return;

  try {
    await supabase.storage.from(env.supabaseBucket).remove([storagePath]);
  } catch (error) {
    console.error("[SUPABASE] Cleanup error", {
      storagePath,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function uploadPlatformIcon(file: Express.Multer.File) {
  validateScreenshotFile(file);
  ensureSupabaseConfigured();

  const storagePath = `platforms/${randomUUID()}${getFileExtension(file.mimetype)}`;
  const startedAt = Date.now();

  try {
    const { data, error } = await supabase!.storage
      .from(env.supabaseBucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        cacheControl: "3600",
      });

    if (error || !data?.path) {
      throw new ApiError(
        500,
        `Supabase upload failed for ${file.originalname}: ${error?.message ?? "unknown error"}`,
      );
    }

    const signedUrl = await createSignedUrl(storagePath);
    const persistedReference = `supabase://${env.supabaseBucket}/${storagePath}`;


    return {
      storagePath,
      imageUrl: signedUrl ?? persistedReference,
      persistedReference,
    };
  } catch (error) {
    console.error("[SUPABASE] uploadPlatformIcon error", {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function uploadGenericImage(file: Express.Multer.File, folder: string) {
  validateScreenshotFile(file);
  ensureSupabaseConfigured();

  const storagePath = `${folder}/${randomUUID()}${getFileExtension(file.mimetype)}`;

  try {
    const { data, error } = await supabase!.storage
      .from(env.supabaseBucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        cacheControl: "3600",
      });

    if (error || !data?.path) {
      throw new ApiError(
        500,
        `Le téléchargement de l'image a échoué: ${error?.message ?? "erreur inconnue"}`,
      );
    }

    const signedUrl = await createSignedUrl(storagePath);
    const persistedReference = `supabase://${env.supabaseBucket}/${storagePath}`;

    return {
      storagePath,
      imageUrl: signedUrl ?? persistedReference,
      persistedReference,
    };
  } catch (error) {
    console.error(`[SUPABASE] uploadGenericImage (${folder}) error`, error);
    throw error;
  }
}

export async function uploadOrganizationLogo(file: Express.Multer.File) {
  return uploadGenericImage(file, "organizations");
}

export async function uploadProfileAvatar(file: Express.Multer.File) {
  return uploadGenericImage(file, "profiles");
}
