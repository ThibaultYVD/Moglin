import type { 
  Message, 
  MessageRecipient, 
  ApiKey, 
  EmailTemplate, 
  RateLimit, 
  Webhook, 
  WebhookDelivery, 
  AuditLog,
  RecipientType,
  RecipientStatus,
  EventKind,
  ApiKeyStatus,
  TemplateStatus,
  WebhookStatus,
  AuditAction
} from '@prisma/client';

// Types d'entrée pour les DTOs
export interface CreateMessageDto {
  fromEmail: string;
  fromName?: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  templateId?: string;
  templateVars?: Record<string, any>;
  priority?: number;
  tags?: string[];
  recipients: {
    type: RecipientType;
    email: string;
  }[];
}

export interface CreateApiKeyDto {
  name: string;
  scopes: string[];
  rateLimit?: number;
  description?: string;
  expiresAt?: Date;
}

export interface CreateTemplateDto {
  name: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  variables: string[];
  description?: string;
  category?: string;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: EventKind[];
  secret?: string;
  timeout?: number;
  retryCount?: number;
  description?: string;
}

// Types de réponse
export interface MessageWithRecipients extends Message {
  recipients: MessageRecipient[];
  template?: EmailTemplate | null;
  apiKey?: ApiKey | null;
}

export interface ApiKeyWithUsage extends ApiKey {
  _count: {
    messages: number;
    auditLogs: number;
  };
  lastUsedAt?: Date | null;
}

export interface TemplateWithUsage extends EmailTemplate {
  _count: {
    messages: number;
  };
}

// Types pour les statistiques
export interface MessageStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byStatus: Record<string, number>;
  byDay: Array<{
    date: string;
    count: number;
  }>;
}

export interface ApiKeyStats {
  totalRequests: number;
  requestsToday: number;
  rateLimitRemaining: number;
  lastUsedAt?: Date;
}

// Types pour les webhooks
export interface WebhookPayload {
  event: EventKind;
  timestamp: string;
  data: {
    messageId: string;
    recipientId?: string;
    email?: string;
    status?: string;
    details?: Record<string, any>;
  };
}

// Types pour l'audit
export interface AuditLogWithApiKey extends AuditLog {
  apiKey?: ApiKey | null;
}

// Types pour les requêtes
export interface MessageQuery {
  apiKeyId?: string;
  status?: string;
  fromEmail?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface ApiKeyQuery {
  status?: ApiKeyStatus;
  scopes?: string[];
  limit?: number;
  offset?: number;
}

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Types pour les erreurs
export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}

// Types pour les validations
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Types pour les configurations
export interface EmailConfig {
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
  maxRecipients?: number;
  maxAttachments?: number;
  maxAttachmentSize?: number;
}

export interface RateLimitConfig {
  windowSize: number; // en secondes
  maxRequests: number;
  burstLimit?: number;
}

// Types pour les templates
export interface TemplateRenderResult {
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  errors: string[];
}

// Types pour les webhooks
export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  retryAfter?: number;
}

// Types pour les événements
export interface MessageEventData {
  messageId: string;
  recipientId?: string;
  event: EventKind;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Types pour les rapports
export interface EmailReport {
  period: {
    from: Date;
    to: Date;
  };
  stats: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    failureRate: number;
  };
  topRecipients: Array<{
    email: string;
    count: number;
  }>;
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    count: number;
  }>;
  errors: Array<{
    error: string;
    count: number;
  }>;
}
