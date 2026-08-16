import { AssignmentStatus, AccompanimentType, OrganizationCategory } from "../../generated/prisma/enums";
import { ApiError } from "../../utils/ApiError";
import * as assignedTosRepository from "./assignedTos.repository";
import { CreateAssignedToDto, UpdateAssignedToDto } from "./assignedTos.schema";
import { prisma } from "../../config/prisma";

function categoryToAccompanimentType(category: OrganizationCategory): AccompanimentType {
  switch (category) {
    case "JURIDIQUE":
      return "JUR";
    case "PSYCHIQUE":
      return "PSY";
  }
}

export function getAllAssignedTos() {
  return assignedTosRepository.findAll();
}

export async function getAssignedToById(
  signalementId: number,
  organizationId: number,
) {
  const assignedTo = await assignedTosRepository.findById(
    signalementId,
    organizationId,
  );
  if (!assignedTo) {
    throw new ApiError(404, "Assignment not found.");
  }
  return assignedTo;
}

export async function addAssignedTo(
  signalementId: number,
  organizationId: number,
  type?: AccompanimentType,
) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, category: true, name: true },
  });

  if (!organization) {
    throw new ApiError(404, "Organisation introuvable.");
  }

  if (!organization.category) {
    throw new ApiError(400, "La catégorie de l'organisation est obligatoire pour l'affectation.");
  }

  const expectedType = categoryToAccompanimentType(organization.category);

  if (type === "SUP") {
    throw new ApiError(400, "SUP ne peut pas être assigné à une organisation. Utilisez le rapport de plateforme.");
  }

  if (type && type !== expectedType) {
    throw new ApiError(400, `Le type d'accompagnement ne correspond pas à la catégorie de l'organisation (${organization.category}).`);
  }

  const finalType = type || expectedType;

  const existing = await assignedTosRepository.findById(
    signalementId,
    organizationId,
  );

  if (existing) {
    throw new ApiError(
      409,
      "Cette organisation est déjà associée au signalement.",
    );
  }

  return assignedTosRepository.create(
    AssignmentStatus.ASSIGNED,
    finalType,
    signalementId,
    organizationId,
  );
}

export async function updateAssignedTo(
  data: UpdateAssignedToDto,
  signalementId: number,
  organizationId: number,
) {
  const existing = await getAssignedToById(signalementId, organizationId);
  return assignedTosRepository.update(data, signalementId, organizationId, existing.type);
}

export async function deleteAssignedTo(
  signalementId: number,
  organizationId: number,
) {
  const existing = await getAssignedToById(signalementId, organizationId);
  return assignedTosRepository.deleteById(signalementId, organizationId, existing.type);
}
