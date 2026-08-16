import "dotenv/config";

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  port: process.env.PORT!,
  secretKey: process.env.SECRET_KEY!,
  dbHost: process.env.DB_HOST!,
  dbPort: process.env.DB_PORT!,
  dbUser: process.env.DB_USER!,
  dbPassword: process.env.DB_PASSWORD!,
  dbName: process.env.DB_NAME!,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseBucket: process.env.SUPABASE_BUCKET || "signalement-screenshots",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFrom: process.env.SMTP_FROM || "no-reply@emc-helpline.local",
};
