import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "../src/config/env";
import { logger } from "../src/config/logger";
import bcrypt from "bcrypt";

const adapter = new PrismaMariaDb({
  host: env.dbHost,
  port: Number(env.dbPort),
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
});

const prisma = new PrismaClient({ adapter });

// ─── Roles ───────────────────────────────────────────────────────────────────
async function seedRoles() {
  await prisma.role.createMany({
    data: [
      {
        name: "SUPER_ADMIN",
        description: "Administrateur principal de la plateforme EMCS",
      },
      { name: "ADMIN", description: "Administrateur de la plateforme EMCS" },
      {
        name: "TECHNICIAN",
        description: "Responsable de la validation technique",
      },
      {
        name: "ORGANIZATION_USER",
        description: "Utilisateur d'une organisation partenaire",
      },
    ],
    skipDuplicates: true,
  });
  logger.info("Roles seeded.");
}

// ─── Cyber Violations ────────────────────────────────────────────────────────
async function seedCyberViolence() {
  await prisma.cyberViolence.createMany({
    data: [
      { name: "Cyberharcèlement" },
      { name: "Chantage" },
      { name: "Propos de haine" },
      { name: "Propos racistes ou discriminatoires" },
      { name: "Diffamation" },
      { name: "Usurpation d'identité" },
      { name: "Publication de photos intimes ou personnelles" },
      { name: "Publication de vidéos intimes ou personnelles" },
      { name: "Menace de publier des photos intimes ou personnelles" },
      { name: "Menace de publier des vidéos intimes ou personnelles" },
    ],
    skipDuplicates: true,
  });
  logger.info("CyberViolences seeded.");
}

// ─── Platforms ───────────────────────────────────────────────────────────────
async function seedPlatforms() {
  await prisma.platform.createMany({
    data: [
      { name: "Facebook", email: "support@facebook.com" },
      { name: "Instagram", email: "support@instagram.com" },
      { name: "TikTok", email: "legal@tiktok.com" },
      { name: "WhatsApp", email: "support@support.whatsapp.com" },
      { name: "X", email: "support@x.com" },
      { name: "YouTube", email: "support@youtube.com" },
      { name: "Snapchat", email: "support@snapchat.com" },
      { name: "Telegram", email: "abuse@telegram.org" },
    ],
    skipDuplicates: true,
  });
  logger.info("Platforms seeded.");
}

// ─── Organizations ───────────────────────────────────────────────────────────
async function seedOrganizations() {
  await prisma.organization.createMany({
    data: [
      {
        nickname: "EMC HQ",
        name: "EMC Cyber Violence Protection Headquarters",
        category: "JURIDIQUE",
        email: "contact@emc-helpline.org",
        website: "https://emc-helpline.org",
        description: "Central Helpline Operations Unit and Case Triage Hub.",
      },
      {
        nickname: "Droit En Ligne",
        name: "Association Droit En Ligne",
        category: "JURIDIQUE",
        email: "contact@droitenligne.org",
        website: "https://droitenligne.org",
        description:
          "Association juridique spécialisée dans la protection des mineurs en ligne.",
      },
      {
        nickname: "Psy Support",
        name: "Réseau Écoute et Soutien Psychologique",
        category: "PSYCHIQUE",
        email: "helpline@psysupport.org",
        website: "https://psysupport.org",
        description:
          "Réseau d'accompagnement psychologique pour les victims de cyberviolence.",
      },
    ],
    skipDuplicates: true,
  });
  logger.info("Organizations seeded.");
}

// ─── Users ───────────────────────────────────────────────────────────────────
async function seedUsers() {
  const [superAdminRole, adminRole, techRole] = await Promise.all([
    prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } }),
    prisma.role.findUnique({ where: { name: "ADMIN" } }),
    prisma.role.findUnique({ where: { name: "TECHNICIAN" } }),
  ]);

  if (!superAdminRole || !adminRole || !techRole) {
    throw new Error("Required roles not found. Run seedRoles first.");
  }

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const users = [
    {
      firstName: "El Mahdi",
      lastName: "Daoudi",
      email: "el.medaoudi@gmail.com",
      password: "hello",
      roleId: superAdminRole.id,
    },
    {
      firstName: "Sarah",
      lastName: "Alami",
      email: "s.alami@emc-helpline.org",
      password: "Admin@2026",
      roleId: adminRole.id,
    },
    {
      firstName: "Karim",
      lastName: "Tazi",
      email: "k.tazi@emc-helpline.org",
      password: "Tech@2026",
      roleId: techRole.id,
    },
    {
      firstName: "Nadia",
      lastName: "Mansouri",
      email: "n.mansouri@emc-helpline.org",
      password: "Tech@2026",
      roleId: techRole.id,
    },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      await prisma.user.create({
        data: {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          hashedPassword: await hash(u.password),
          roleId: u.roleId,
        },
      });
    }
  }
  logger.info("Users seeded.");
}

// ─── Demo Signalements + all related data ────────────────────────────────────
async function seedDemoData() {
  const existingCount = await prisma.signalement.count();
  if (existingCount > 0) {
    logger.info("Demo signalements already exist — skipping.");
    return;
  }

  const [facebook, instagram, tiktok, telegram] = await Promise.all([
    prisma.platform.findUnique({ where: { name: "Facebook" } }),
    prisma.platform.findUnique({ where: { name: "Instagram" } }),
    prisma.platform.findUnique({ where: { name: "TikTok" } }),
    prisma.platform.findUnique({ where: { name: "Telegram" } }),
  ]);

  const [cv1, cv2, cv3, cv5, cv6] = await Promise.all([
    prisma.cyberViolence.findFirst({ where: { name: "Cyberharcèlement" } }),
    prisma.cyberViolence.findFirst({ where: { name: "Chantage" } }),
    prisma.cyberViolence.findFirst({ where: { name: "Propos de haine" } }),
    prisma.cyberViolence.findFirst({ where: { name: "Diffamation" } }),
    prisma.cyberViolence.findFirst({
      where: { name: "Usurpation d'identité" },
    }),
  ]);

  const [org1, org2, org3] = await Promise.all([
    prisma.organization.findFirst({ where: { nickname: "EMC HQ" } }),
    prisma.organization.findFirst({ where: { nickname: "Droit En Ligne" } }),
    prisma.organization.findFirst({ where: { nickname: "Psy Support" } }),
  ]);

  const [admin, tech1, tech2] = await Promise.all([
    prisma.user.findUnique({ where: { email: "s.alami@emc-helpline.org" } }),
    prisma.user.findUnique({ where: { email: "k.tazi@emc-helpline.org" } }),
    prisma.user.findUnique({ where: { email: "n.mansouri@emc-helpline.org" } }),
  ]);

  if (!facebook || !instagram || !tiktok || !telegram)
    throw new Error("Platforms missing.");
  if (!cv1 || !cv2 || !cv3 || !cv5 || !cv6)
    throw new Error("CyberViolences missing.");
  if (!org1 || !org2 || !org3) throw new Error("Organizations missing.");
  if (!admin || !tech1 || !tech2) throw new Error("Users missing.");

  const defaultHash = await bcrypt.hash("changeme", 10);

  // ─── Create victims ───────────────────────────────────────────────────────
  const v1 = await prisma.victim.create({
    data: {
      sex: "FEMALE",
      ageGroup: "TEEN_13_17",
      city: "Casablanca",
      isAnonymous: true,
      referenceNumber: "TEMP-1",
      hashedPassword: defaultHash,
    },
  });
  await prisma.victim.update({
    where: { id: v1.id },
    data: { referenceNumber: `EMC-${v1.id}A1B2` },
  });

  const v2 = await prisma.victim.create({
    data: {
      firstName: "Amina",
      lastName: "Benali",
      email: "amina.b@example.com",
      telephone: "0612345678",
      sex: "FEMALE",
      ageGroup: "YOUNG_ADULT_18_25",
      city: "Rabat",
      isAnonymous: false,
      referenceNumber: "TEMP-2",
      hashedPassword: defaultHash,
    },
  });
  await prisma.victim.update({
    where: { id: v2.id },
    data: { referenceNumber: `EMC-${v2.id}C3D4` },
  });

  const v3 = await prisma.victim.create({
    data: {
      sex: "MALE",
      ageGroup: "YOUNG_ADULT_18_25",
      city: "Tanger",
      isAnonymous: true,
      referenceNumber: "TEMP-3",
      hashedPassword: defaultHash,
    },
  });
  await prisma.victim.update({
    where: { id: v3.id },
    data: { referenceNumber: `EMC-${v3.id}E5F6` },
  });

  const v4 = await prisma.victim.create({
    data: {
      firstName: "Khadija",
      lastName: "El Fassi",
      email: "k.elfassi@example.com",
      telephone: "0698765432",
      sex: "FEMALE",
      ageGroup: "ADULT_26_PLUS",
      city: "Marrakech",
      isAnonymous: false,
      referenceNumber: "TEMP-4",
      hashedPassword: defaultHash,
    },
  });
  await prisma.victim.update({
    where: { id: v4.id },
    data: { referenceNumber: `EMC-${v4.id}G7H8` },
  });

  const v5 = await prisma.victim.create({
    data: {
      sex: "MALE",
      ageGroup: "TEEN_13_17",
      city: "Agadir",
      isAnonymous: true,
      referenceNumber: "TEMP-5",
      hashedPassword: defaultHash,
    },
  });
  await prisma.victim.update({
    where: { id: v5.id },
    data: { referenceNumber: `EMC-${v5.id}I9J0` },
  });

  logger.info("Victims seeded.");

  // ─── Create signalements ──────────────────────────────────────────────────
  const sig1 = await prisma.signalement.create({
    data: {
      description:
        "Harcèlement intensif et diffusion de photos sans consentement sur Instagram ciblant une mineure.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      issuer: "PUBLIC_FORM",
      victimId: v1.id,
      cyberViolenceId: cv1.id,
      reportedItems: {
        create: [
          {
            type: "PROFILE",
            contentUrl: "https://instagram.com/fake-sig1",
            description: "Faux profil usurpant l'identité de la victim",
            platformId: instagram.id,
            screenshots: {
              create: [
                {
                  imageUrl:
                    "https://placehold.co/800x600/E2F0FF/3B82F6?text=Capture+1",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const sig2 = await prisma.signalement.create({
    data: {
      description:
        "Chantage avec menace de publication de vidéos intimes. Contact initial par Facebook.",
      status: "PENDING",
      priority: "HIGH",
      issuer: "HELPLINE_CALL",
      victimId: v2.id,
      cyberViolenceId: cv2.id,
      reportedItems: {
        create: [
          {
            type: "POST",
            contentUrl: "https://facebook.com/post/fake-sig2",
            description: "Publication menaçante sur Facebook",
            platformId: facebook.id,
            screenshots: {
              create: [
                {
                  imageUrl:
                    "https://placehold.co/800x600/FFF3CD/F59E0B?text=Capture+2",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const sig3 = await prisma.signalement.create({
    data: {
      description:
        "Diffamation massive dans un groupe Telegram avec publication des coordonnées personnelles de la victim.",
      status: "VALIDATED",
      priority: "URGENT",
      issuer: "PUBLIC_FORM",
      victimId: v3.id,
      cyberViolenceId: cv5.id,
      reportedItems: {
        create: [
          {
            type: "COMMENT",
            contentUrl: "https://t.me/fakegroup-sig3",
            description:
              "Groupe Telegram diffusant des informations personnelles",
            platformId: telegram.id,
            screenshots: {
              create: [
                {
                  imageUrl:
                    "https://placehold.co/800x600/D1FAE5/10B981?text=Capture+3",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const sig4 = await prisma.signalement.create({
    data: {
      description:
        "Usurpation d'identité sur Facebook avec escroquerie financière ciblant les contacts de la victim.",
      status: "CLOSED",
      priority: "NORMAL",
      issuer: "POLICE_REFERRAL",
      victimId: v4.id,
      cyberViolenceId: cv6.id,
      reportedItems: {
        create: [
          {
            type: "PROFILE",
            contentUrl: "https://facebook.com/fake.profile.sig4",
            description: "Faux compte Facebook imitant la victim",
            platformId: facebook.id,
            screenshots: {
              create: [
                {
                  imageUrl:
                    "https://placehold.co/800x600/F3F4F6/6B7280?text=Capture+4",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const sig5 = await prisma.signalement.create({
    data: {
      description:
        "Commentaires haineux coordonnés dans la section commentaires d'une vidéo TikTok.",
      status: "REJECTED",
      priority: "NORMAL",
      issuer: "PUBLIC_FORM",
      victimId: v5.id,
      cyberViolenceId: cv3.id,
      reportedItems: {
        create: [
          {
            type: "COMMENT",
            contentUrl: "https://tiktok.com/@fake/video/sig5",
            description: "Vidéo TikTok ciblée par des commentaires haineux",
            platformId: tiktok.id,
            screenshots: {
              create: [
                {
                  imageUrl:
                    "https://placehold.co/800x600/FEE2E2/EF4444?text=Capture+5",
                },
              ],
            },
          },
        ],
      },
    },
  });

  logger.info("Signalements seeded.");

  // ─── Platform reports ─────────────────────────────────────────────────────
  await prisma.platformReport.createMany({
    data: [
      {
        signalementId: sig1.id,
        platformId: instagram.id,
        status: "PROCESSING",
        emailSubject: `Demande de retrait — Cas #${sig1.id}`,
        emailBody:
          "Demande officielle de suppression de contenu illicite conformément aux CGU d'Instagram.",
        emailTo: instagram.email,
      },
      {
        signalementId: sig3.id,
        platformId: telegram.id,
        status: "SENT",
        emailSubject: `Avis de suppression — Cas #${sig3.id}`,
        emailBody:
          "Notification de suppression de contenu suite à validation administrateur.",
        emailTo: telegram.email,
      },
    ],
    skipDuplicates: true,
  });

  logger.info("Platform reports seeded.");

  // ─── Validations ──────────────────────────────────────────────────────────
  await prisma.validate.createMany({
    data: [
      {
        signalementId: sig1.id,
        userId: tech1.id,
        type: "TECHNICIAN",
        status: "APPROVED",
        reason:
          "Preuves numériques vérifiées. URL de contenu confirmée active et archivée.",
      },
      {
        signalementId: sig3.id,
        userId: tech1.id,
        type: "TECHNICIAN",
        status: "APPROVED",
        reason: "Contenu illicite confirmé, captures d'écran archivées.",
      },
      {
        signalementId: sig3.id,
        userId: admin.id,
        type: "ADMIN",
        status: "APPROVED",
        reason:
          "Validation admin complète. Notification légale envoyée à Telegram.",
      },
      {
        signalementId: sig5.id,
        userId: tech2.id,
        type: "TECHNICIAN",
        status: "REJECTED",
        reason:
          "Preuves insuffisantes. URL de contenu inaccessible ou déjà supprimée.",
      },
    ],
    skipDuplicates: true,
  });

  logger.info("Validations seeded.");

  // ─── Assignments ──────────────────────────────────────────────────────────
  await prisma.assignedTo.createMany({
    data: [
      {
        signalementId: sig1.id,
        organizationId: org2.id,
        type: "JUR",
        status: "IN_PROGRESS",
        reason:
          "Affecté à Droit En Ligne pour conseil juridique et dépôt de plainte.",
      },
      {
        signalementId: sig2.id,
        organizationId: org3.id,
        type: "PSY",
        status: "PENDING",
        reason:
          "Affecté au réseau Psy Support pour écoute et soutien psychologique urgent.",
      },
      {
        signalementId: sig3.id,
        organizationId: org1.id,
        type: "JUR",
        status: "COMPLETED",
        reason: "Suivi terminé par l'équipe centrale EMC après validation.",
      },
    ],
    skipDuplicates: true,
  });

  logger.info("Assignments seeded.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  logger.info("Starting database seed...");
  await seedRoles();
  await seedCyberViolence();
  await seedPlatforms();
  await seedOrganizations();
  await seedUsers();
  await seedDemoData();
  logger.info("Database seed complete!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
