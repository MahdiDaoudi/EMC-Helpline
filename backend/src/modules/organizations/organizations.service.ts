import * as organizationsRepository from "./organizations.repository";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "./organizations.schema";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { OrganizationCategory } from "../../generated/prisma/enums";
import { createSignedUrl } from "../../services/supabaseStorage.service";

async function enrichOrg<T extends { image?: string | null }>(org: T | null): Promise<T | null> {
  if (!org || !org.image) return org;
  if (org.image.startsWith("supabase://")) {
    const rawPath = org.image.replace(/^supabase:\/\/[^/]+\//, "");
    const signed = await createSignedUrl(rawPath);
    if (signed) org.image = signed;
  }
  return org;
}

export async function getAllOrganizations() {
  const orgs = await organizationsRepository.findAll();
  return Promise.all(orgs.map((o) => enrichOrg(o)));
}

export async function getOrganizationById(id: number) {
  const org = await organizationsRepository.findById(id);
  return enrichOrg(org);
}

export async function addOrganization(data: CreateOrganizationDto) {
  // Prevent duplicates proactively
  const byName = await prisma.organization.findUnique({
    where: { name: data.name },
  });
  if (byName) {
    throw new ApiError(409, "Une organisation avec ce nom existe déjà.");
  }
  const byEmail = await prisma.organization.findUnique({
    where: { email: data.email },
  });
  if (byEmail) {
    throw new ApiError(409, "Une organisation avec cet email existe déjà.");
  }
  if (!data.category) {
    throw new ApiError(400, "La catégorie de l'organisation est obligatoire.");
  }
  return await organizationsRepository.create(data);
}

export async function updateOrganization(
  id: number,
  data: UpdateOrganizationDto,
) {
  // Prevent duplicates proactively
  if (data.name) {
    const byName = await prisma.organization.findUnique({
      where: { name: data.name },
    });
    if (byName && byName.id !== id) {
      throw new ApiError(409, "Une organisation avec ce nom existe déjà.");
    }
  }
  if (data.email) {
    const byEmail = await prisma.organization.findUnique({
      where: { email: data.email },
    });
    if (byEmail && byEmail.id !== id) {
      throw new ApiError(409, "Une organisation avec cet email existe déjà.");
    }
  }
  if (data.category && !Object.values(OrganizationCategory).includes(data.category)) {
    throw new ApiError(400, "Catégorie invalide.");
  }

  if (data.category) {
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { category: true },
    });

    if (org && org.category !== data.category) {
      const conflictingAssignments = await prisma.assignedTo.count({
        where: { organizationId: id },
      });

      if (conflictingAssignments > 0) {
        throw new ApiError(
          400,
          "Impossible de modifier la catégorie d'une organisation ayant des affectations existantes.",
        );
      }
    }
  }

  return await organizationsRepository.update(id, data);
}

export async function deleteOrganization(id: number) {
  const org = await organizationsRepository.findById(id);
  if (!org) {
    throw new ApiError(404, "Organisation introuvable.");
  }

  // Check dependent records: users and assignedTo
  const [userCount, assignedCount] = await Promise.all([
    prisma.user.count({ where: { organizationId: id } }),
    prisma.assignedTo.count({ where: { organizationId: id } }),
  ]);

  if (userCount > 0 || assignedCount > 0) {
    throw new ApiError(
      400,
      "Cette organisation possède des données associées et ne peut pas être supprimée.",
    );
  }

  return organizationsRepository.deleteById(id);
}
