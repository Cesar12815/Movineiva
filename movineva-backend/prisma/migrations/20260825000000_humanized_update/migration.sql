-- AlterTable: Añadir campos de personalización al Usuario
ALTER TABLE "users" ADD COLUMN "secretPin" TEXT;
ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "config" JSONB DEFAULT '{"themeColor": "#2563eb", "voiceVolume": 0.8, "alertVolume": 1.0}';

-- CreateTable: Crear tabla de Mensajes Internos (Buzón Pro)
CREATE TABLE "internal_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "internal_messages" ADD CONSTRAINT "internal_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
