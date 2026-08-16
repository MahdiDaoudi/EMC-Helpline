import {
  AccompanimentType,
  Priority,
  SignalementStatus,
  Titulaire,
} from "../../generated/prisma/enums";

export type CreateSignalementWithExistingVictimData = {
  victimId: number;
  status: SignalementStatus;
  priority: Priority;
  issuer: string;
  titulaire: Titulaire;
  accompanimentTypes?: AccompanimentType[];
};

export type CreateSignalementWithNewVictimData = {
  referenceNumber: string;
  hashedPassword: string;
  isAnonymous: boolean;
  status: SignalementStatus;
  priority: Priority;
  issuer: string;
  titulaire: Titulaire;
  accompanimentTypes?: AccompanimentType[];
};
