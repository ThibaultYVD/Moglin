# Structure de la Base de Données - API d'Envoi de Mail

## Vue d'ensemble

Cette base de données PostgreSQL est conçue pour une API complète d'envoi de mail avec les fonctionnalités suivantes :

- **Gestion des emails** : Envoi, suivi, templates
- **Authentification** : Clés API avec scopes et limitations
- **Rate limiting** : Contrôle du débit par clé API
- **Webhooks** : Notifications en temps réel
- **Audit** : Traçabilité complète des actions
- **Templates** : Système de templates réutilisables

## Modèles Principaux

### 1. Message
Représente un email à envoyer.

**Champs clés :**
- `id` : Identifiant unique
- `idempotencyKey` : Clé pour éviter les doublons
- `fromEmail`, `fromName` : Expéditeur
- `subject`, `bodyText`, `bodyHtml` : Contenu
- `templateId`, `templateVars` : Template et variables
- `apiKeyId` : Clé API utilisée
- `status` : Statut global (QUEUED, SENDING, SENT, FAILED)
- `tags` : Catégorisation des emails

### 2. MessageRecipient
Destinataires d'un email (TO, CC, BCC).

**Champs clés :**
- `type` : Type de destinataire (TO, CC, BCC)
- `email` : Adresse email
- `status` : Statut de livraison
- `providerMessageId` : ID du fournisseur SMTP

### 3. ApiKey
Gestion des clés API pour l'authentification.

**Champs clés :**
- `keyHash` : Hash de la clé API
- `salt` : Salt pour le hashage
- `scopes` : Permissions (ex: ["email:send", "email:read"])
- `rateLimit` : Limite de débit par minute
- `status` : ACTIVE, REVOKED, SUSPENDED

### 4. EmailTemplate
Templates d'emails réutilisables.

**Champs clés :**
- `name` : Nom unique du template
- `subject`, `bodyText`, `bodyHtml` : Contenu du template
- `variables` : Variables disponibles (ex: ["userName", "email"])
- `status` : ACTIVE, INACTIVE, DRAFT

### 5. RateLimit
Contrôle du débit par clé API.

**Champs clés :**
- `windowStart` : Début de la fenêtre de temps
- `requestCount` : Nombre de requêtes dans la fenêtre
- `windowSize` : Taille de la fenêtre en secondes

### 6. Webhook
Configuration des webhooks pour les notifications.

**Champs clés :**
- `url` : URL de destination
- `events` : Types d'événements à écouter
- `secret` : Secret pour signer les payloads
- `timeout`, `retryCount` : Configuration de livraison

### 7. WebhookDelivery
Historique des livraisons de webhooks.

**Champs clés :**
- `payload` : Données envoyées
- `status` : PENDING, SUCCESS, FAILED
- `responseCode`, `responseBody` : Réponse du serveur

### 8. AuditLog
Traçabilité des actions.

**Champs clés :**
- `action` : Type d'action (EMAIL_SENT, API_KEY_CREATED, etc.)
- `resourceId` : ID de la ressource concernée
- `details` : Détails supplémentaires en JSON

## Relations

```
ApiKey (1) ──→ (N) Message
ApiKey (1) ──→ (N) RateLimit
ApiKey (1) ──→ (N) AuditLog

Message (1) ──→ (N) MessageRecipient
Message (1) ──→ (N) Attachment
Message (1) ──→ (N) MessageEvent

EmailTemplate (1) ──→ (N) Message

Webhook (1) ──→ (N) WebhookDelivery
```

## Index et Performances

### Index principaux :
- `Message.createdAt` : Requêtes temporelles
- `Message.apiKeyId` : Filtrage par clé API
- `MessageRecipient.email` : Recherche par destinataire
- `ApiKey.keyHash` : Authentification rapide
- `RateLimit.apiKeyId + windowStart` : Rate limiting efficace

### Optimisations :
- Utilisation de `@db.Timestamptz(6)` pour les timestamps
- Index composites pour les requêtes fréquentes
- Relations avec `onDelete: Cascade` pour la cohérence

## Utilisation

### 1. Générer le client Prisma
```bash
npm run db:generate
```

### 2. Appliquer les migrations
```bash
npm run db:migrate
```

### 3. Seeder la base de données
```bash
npm run db:seed
```

### 4. Ouvrir Prisma Studio
```bash
npm run db:studio
```

## Exemples d'utilisation

### Créer une clé API
```typescript
const apiKey = await prisma.apiKey.create({
  data: {
    name: 'Production API Key',
    keyHash: hash,
    salt: salt,
    scopes: ['email:send'],
    rateLimit: 1000,
  },
});
```

### Envoyer un email
```typescript
const message = await prisma.message.create({
  data: {
    fromEmail: 'noreply@example.com',
    subject: 'Test Email',
    bodyHtml: '<h1>Hello World</h1>',
    apiKeyId: apiKey.id,
    recipients: {
      create: [
        { type: 'TO', email: 'user@example.com' }
      ]
    }
  },
});
```

### Créer un template
```typescript
const template = await prisma.emailTemplate.create({
  data: {
    name: 'welcome',
    subject: 'Bienvenue {{userName}} !',
    bodyHtml: '<h1>Bienvenue {{userName}} !</h1>',
    variables: ['userName'],
    status: 'ACTIVE',
  },
});
```
