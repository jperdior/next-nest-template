-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ROLE_USER',
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpiry" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex (partial index for token lookups)
CREATE INDEX "users_emailVerificationToken_idx" ON "users"("emailVerificationToken") WHERE "emailVerificationToken" IS NOT NULL;

-- CreateIndex (partial index for token lookups)
CREATE INDEX "users_passwordResetToken_idx" ON "users"("passwordResetToken") WHERE "passwordResetToken" IS NOT NULL;
