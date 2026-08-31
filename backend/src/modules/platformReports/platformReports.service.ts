import { PlatformReportStatus } from "../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { sendPlatformReportEmail } from "../../services/email.service";
import { createSignedUrl } from "../../services/supabaseStorage.service";
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

  let fetchUrl = trimmed;
  if (trimmed.startsWith("supabase://")) {
    const path = trimmed.replace(/^supabase:\/\/[^\/]+\//, "");
    const signed = await createSignedUrl(path);
    if (signed) fetchUrl = signed;
  } else if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const signed = await createSignedUrl(trimmed);
    if (signed) fetchUrl = signed;
  }

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error("[REPORT EMAIL] Failed to fetch screenshot:", fetchUrl, response.statusText);
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
  } catch (err) {
    console.error("[REPORT EMAIL] Exception fetching screenshot:", fetchUrl, err);
    return null;
  }
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

    const links = (data.selectedLinks ?? []).filter((l) => l?.trim());
    let linksHtml = "";
    let linksText = "";

    if (links.length > 0) {
      linksHtml = `
        <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px;">Lien(s) du contenu signalé :</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${links.map((link) => `<li style="margin-bottom: 4px;"><a href="${escapeHtml(link)}" target="_blank" style="color: #2563eb; text-decoration: underline;">${escapeHtml(link)}</a></li>`).join("")}
          </ul>
        </div>
      `;
      linksText = `\n\nLien(s) du contenu signalé :\n${links.map((l) => `- ${l}`).join("\n")}`;
    }

    const htmlBody = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #334155; line-height: 1.6; max-width: 600px;">
        <p style="margin-top: 0;">${escapeHtml(data.emailBody).replace(/\n/g, "<br />")}</p>
        ${linksHtml}
      </div>
    `;

    const textBody = `${data.emailBody}${linksText}`;

    const mailResult = await sendPlatformReportEmail({
      to: safeEmailTo,
      subject: data.emailSubject,
      html: htmlBody,
      text: textBody,
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
