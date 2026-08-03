import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "../src/config/env";
import { logger } from "../src/config/logger";
import bcrypt from 'bcrypt'

const adapter = new PrismaMariaDb({
  host: env.dbHost,
  port: Number(env.dbPort),
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
});

const prisma = new PrismaClient({ adapter });

async function seedRoles() {
  await prisma.role.createMany({
    data: [
      {
        name: "SUPER_ADMIN",
        description: "Administrateur principal de la plateforme EMCS",
      },
      {
        name: "ADMIN",
        description: "Administrateur de la plateforme EMCS",
      },
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
  logger.info("Seed Completed.")
}

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
    skipDuplicates:true,
  });
  logger.info("Seed Completed.")
}


async function seedPlatforms() {
  await prisma.platform.createMany({
    data:[
      { name: "Facebook", email: "support@facebook.com" },
      { name: "Instagram", email: "support@instagram.com" },
      { name: "TikTok", email: "legal@tiktok.com" },
      { name: "WhatsApp", email: "support@support.whatsapp.com" },
      { name: "X", email: "support@x.com" },
      { name: "YouTube", email: "support@youtube.com" },
      { name: "Snapchat", email: "support@snapchat.com" },
      { name: "Telegram", email: "abuse@telegram.org" },
    ],
    skipDuplicates:true,
  })
  logger.info("Seed Completed.")
}

async function seedSuperAdmin() {
  const superAdminRole = await prisma.role.findUnique({
    where:{
      name : "SUPER_ADMIN"
    }
  })

  if(!superAdminRole){
    throw new Error("SUPER_ADMIN role not found.")
  }

  const isExiste = await prisma.user.findUnique({
    where:{
      email:"el.medaoudi@gmail.com"
    }
  })

  if(isExiste) return;

  await prisma.user.create({
    data:{
      firstName:"El Mahdi",
      lastName:"Daoudi",
      email:"el.medaoudi@gmail.com",
      hashedPassword: await bcrypt.hash("hello",10),
      roleId:superAdminRole.id
    },
  })
}


async function main(){
  await seedRoles();
  await seedCyberViolence();
  await seedPlatforms();
  await seedSuperAdmin();
}

main().catch(console.error).finally(async ()=>{
  await prisma.$disconnect();
})