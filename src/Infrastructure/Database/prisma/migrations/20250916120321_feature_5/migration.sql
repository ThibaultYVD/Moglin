-- CreateEnum
CREATE TYPE "public"."RecipientType" AS ENUM ('TO', 'CC', 'BCC');

-- CreateEnum
CREATE TYPE "public"."RecipientStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "public"."EventKind" AS ENUM ('DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINT', 'DEFERRED');

-- CreateEnum
CREATE TYPE "public"."ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."TemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."WebhookStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('EMAIL_SENT', 'EMAIL_FAILED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'TEMPLATE_CREATED', 'TEMPLATE_UPDATED', 'WEBHOOK_CREATED', 'WEBHOOK_UPDATED', 'RATE_LIMIT_EXCEEDED');

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "templateId" TEXT,
    "templateVars" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "apiKeyId" TEXT,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "sentAt" TIMESTAMPTZ(6),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageRecipient" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" "public"."RecipientType" NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."RecipientStatus" NOT NULL DEFAULT 'QUEUED',
    "lastError" TEXT,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MessageRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliveryAttempt" (
    "id" BIGSERIAL NOT NULL,
    "recipientId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,
    "success" BOOLEAN NOT NULL,
    "responseCode" INTEGER,
    "responseMessage" TEXT,

    CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageEvent" (
    "id" BIGSERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipientId" TEXT,
    "kind" "public"."EventKind" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "scopes" TEXT[],
    "status" "public"."ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "rateLimit" INTEGER,
    "description" TEXT,
    "lastUsedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "status" "public"."TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "variables" TEXT[],
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateLimit" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "windowStart" TIMESTAMPTZ(6) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "windowSize" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Webhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" "public"."EventKind"[],
    "status" "public"."WebhookStatus" NOT NULL DEFAULT 'ACTIVE',
    "secret" TEXT,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "retryCount" INTEGER NOT NULL DEFAULT 3,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMPTZ(6),

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "action" "public"."AuditAction" NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_idempotencyKey_key" ON "public"."Message"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_apiKeyId_idx" ON "public"."Message"("apiKeyId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "public"."Message"("status");

-- CreateIndex
CREATE INDEX "Message_fromEmail_idx" ON "public"."Message"("fromEmail");

-- CreateIndex
CREATE INDEX "MessageRecipient_messageId_idx" ON "public"."MessageRecipient"("messageId");

-- CreateIndex
CREATE INDEX "MessageRecipient_email_idx" ON "public"."MessageRecipient"("email");

-- CreateIndex
CREATE INDEX "MessageRecipient_status_idx" ON "public"."MessageRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRecipient_messageId_type_email_key" ON "public"."MessageRecipient"("messageId", "type", "email");

-- CreateIndex
CREATE INDEX "DeliveryAttempt_recipientId_idx" ON "public"."DeliveryAttempt"("recipientId");

-- CreateIndex
CREATE INDEX "DeliveryAttempt_startedAt_idx" ON "public"."DeliveryAttempt"("startedAt");

-- CreateIndex
CREATE INDEX "Attachment_messageId_idx" ON "public"."Attachment"("messageId");

-- CreateIndex
CREATE INDEX "MessageEvent_messageId_idx" ON "public"."MessageEvent"("messageId");

-- CreateIndex
CREATE INDEX "MessageEvent_recipientId_idx" ON "public"."MessageEvent"("recipientId");

-- CreateIndex
CREATE INDEX "MessageEvent_createdAt_idx" ON "public"."MessageEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "public"."ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "public"."ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_status_idx" ON "public"."ApiKey"("status");

-- CreateIndex
CREATE INDEX "ApiKey_createdAt_idx" ON "public"."ApiKey"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "public"."EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "EmailTemplate_name_idx" ON "public"."EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "EmailTemplate_status_idx" ON "public"."EmailTemplate"("status");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "public"."EmailTemplate"("category");

-- CreateIndex
CREATE INDEX "RateLimit_apiKeyId_idx" ON "public"."RateLimit"("apiKeyId");

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "public"."RateLimit"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_apiKeyId_windowStart_key" ON "public"."RateLimit"("apiKeyId", "windowStart");

-- CreateIndex
CREATE INDEX "Webhook_status_idx" ON "public"."Webhook"("status");

-- CreateIndex
CREATE INDEX "Webhook_createdAt_idx" ON "public"."Webhook"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "public"."WebhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_idx" ON "public"."WebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "public"."WebhookDelivery"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_apiKeyId_idx" ON "public"."AuditLog"("apiKeyId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageRecipient" ADD CONSTRAINT "MessageRecipient_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."MessageRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageEvent" ADD CONSTRAINT "MessageEvent_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageEvent" ADD CONSTRAINT "MessageEvent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."MessageRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RateLimit" ADD CONSTRAINT "RateLimit_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "public"."Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
