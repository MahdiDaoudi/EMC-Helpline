import { PlatformReportStatus } from "../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { sendPlatformReportEmail } from "../../services/email.service";
import * as platformReportsRepository from "./platformReports.repository";
import {
  CreatePlatformReportDto,
  UpdatePlatformReportDto,
} from "./platformReports.schema";

export function getAllPlatformReports() {
  return platformReportsRepository.findAll();
}

export async function getPlatformReportById(
  signalementId: number,
  platformId: number,
) {
  const platformReport = await platformReportsRepository.findById(
    signalementId,
    platformId,
  );
  if (!platformReport) {
    throw new ApiError(404, "PlatformReport not found.");
  }
  return platformReport;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function resolveScreenshotAttachment(url: string, index: number) {
  const trimmed = url.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("data:")) {
    const match = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
    if (!match) {
      return null;
    }

    return {
      filename: `screenshot-${index + 1}.png`,
      content: Buffer.from(match[2], "base64"),
      contentType: match[1],
    };
  }

  const response = await fetch(trimmed);
  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());

  const extension = contentType.includes("jpeg")
    ? ".jpg"
    : contentType.includes("png")
      ? ".png"
      : ".bin";

  return {
    filename: `screenshot-${index + 1}${extension}`,
    content: buffer,
    contentType,
  };
}

export async function addPlatformReport(data: CreatePlatformReportDto) {
  const signalement = await prisma.signalement.findUnique({
    where: { id: data.signalementId },
    include: {
      reportedItems: {
        include: {
          platform: true,
          screenshots: true,
        },
      },
    },
  });

  if (!signalement) {
    throw new ApiError(404, "Signalement not found.");
  }

  const platformIds = new Set(
    signalement.reportedItems.map((item) => item.platformId),
  );
  if (!platformIds.has(data.platformId)) {
    throw new ApiError(
      400,
      "Selected platform is not reported in this signalement.",
    );
  }

  const platform = await prisma.platform.findUnique({
    where: { id: data.platformId },
  });

  if (!platform?.email) {
    throw new ApiError(
      400,
      "No destination email available for the selected platform.",
    );
  }

  const allowedUrls = new Set(
    signalement.reportedItems
      .filter((item) => item.platformId === data.platformId)
      .flatMap((item) =>
        item.screenshots.map((screenshot) => screenshot.imageUrl),
      ),
  );

  const invalidScreenshotUrls = (data.selectedScreenshotUrls ?? []).filter(
    (url) => !allowedUrls.has(url),
  );
  if (invalidScreenshotUrls.length > 0) {
    throw new ApiError(
      400,
      "Selected screenshots do not belong to the current signalement/platform.",
    );
  }

  const safeEmailTo = platform.email;
  const record = await platformReportsRepository.create(
    {
      ...data,
      emailTo: safeEmailTo,
    },
    PlatformReportStatus.PENDING,
  );

  try {
    const attachments = await Promise.all(
      (data.selectedScreenshotUrls ?? []).map((url, index) =>
        resolveScreenshotAttachment(url, index),
      ),
    );

    const filteredAttachments = attachments.filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        Boolean(attachment),
    );

    const mailResult = await sendPlatformReportEmail({
      to: safeEmailTo,
      subject: data.emailSubject,
      html: `<p>${escapeHtml(data.emailBody).replace(/\n/g, "<br />")}</p>`,
      text: data.emailBody,
      attachments: filteredAttachments,
    });

    const nextStatus = mailResult.hasError
      ? PlatformReportStatus.REJECTED
      : PlatformReportStatus.SENT;

    return platformReportsRepository.update(
      {
        status: nextStatus,
      },
      data.signalementId,
      data.platformId,
    );
  } catch (error) {
    await platformReportsRepository.update(
      {
        status: PlatformReportStatus.REJECTED,
      },
      data.signalementId,
      data.platformId,
    );
    throw error;
  }
}

export async function updatePlatformReport(
  data: UpdatePlatformReportDto,
  signalementId: number,
  platformId: number,
) {
  await getPlatformReportById(signalementId, platformId);
  return platformReportsRepository.update(data, signalementId, platformId);
}

export async function deletePlatformReport(
  signalementId: number,
  platformId: number,
) {
  await getPlatformReportById(signalementId, platformId);
  return platformReportsRepository.deleteById(signalementId, platformId);
}
