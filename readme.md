# Moglin - API d'Envoi de Mail

Une API complète d'envoi de mail avec authentification par clés API, templates, webhooks et audit trail.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- PostgreSQL (via Docker)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd Moglin
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer la base de données**
```bash
docker-compose up -d postgres
```

4. **Configurer l'environnement**
Créez un fichier `.env` avec :
```env
DATABASE_URL="postgresql://moglin:example@localhost:5432/moglin?schema=public"
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
FROM_EMAIL=noreply@example.com
FROM_NAME=Moglin API
NODE_ENV=development
PORT=3000
```

5. **Appliquer les migrations**
```bash
npm run db:migrate
```

6. **Seeder la base de données**
```bash
npm run db:seed
```

7. **Démarrer l'application**
```bash
npm run dev
```

## 📊 Base de Données

### Structure
La base de données inclut les modèles suivants :

- **Message** : Emails à envoyer avec métadonnées
- **MessageRecipient** : Destinataires (TO, CC, BCC)
- **ApiKey** : Authentification avec scopes et limitations
- **EmailTemplate** : Templates réutilisables
- **RateLimit** : Contrôle du débit
- **Webhook** : Notifications en temps réel
- **AuditLog** : Traçabilité des actions

### Commandes Utiles

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Seeder avec des données de test
npm run db:seed

# Ouvrir Prisma Studio
npm run db:studio

# Reset complet de la base
npm run db:reset
```

## 🔑 Authentification

L'API utilise des clés API avec :
- Hashage sécurisé des clés
- Scopes pour les permissions
- Rate limiting configurable
- Expiration optionnelle

### Clé API de Test
Après le seeding, une clé API de test est créée :
```
Clé API: test-key-8fabcb0b02766f8ff0f66c261b378cfc
```

## 📧 Envoi d'Emails

### Endpoint
```
POST /api/emails/send
```

### Headers
```
Authorization: Bearer <api-key>
Content-Type: application/json
```

### Body
```json
{
  "to": "user@example.com",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Test Email",
  "text": "Contenu texte",
  "html": "<h1>Contenu HTML</h1>"
}
```

## 🎨 Templates

### Créer un Template
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

### Utiliser un Template
```json
{
  "to": "user@example.com",
  "templateId": "template-id",
  "templateVars": {
    "userName": "John Doe"
  }
}
```

## 🔗 Webhooks

### Configuration
```typescript
const webhook = await prisma.webhook.create({
  data: {
    name: 'Email Events',
    url: 'https://your-app.com/webhooks/email',
    events: ['DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED'],
    secret: 'webhook-secret',
  },
});
```

### Payload
```json
{
  "event": "DELIVERED",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "messageId": "msg-123",
    "recipientId": "recip-456",
    "email": "user@example.com",
    "status": "DELIVERED"
  }
}
```

## 📈 Monitoring

### Prisma Studio
```bash
npm run db:studio
```
Ouvre l'interface web pour explorer la base de données.

### Logs d'Audit
Toutes les actions sont tracées dans `AuditLog` :
- Envoi d'emails
- Création/révocation de clés API
- Modifications de templates
- Événements de webhooks

## 🛠️ Développement

### Structure du Projet
```
src/
├── Api/Controllers/     # Contrôleurs REST
├── Application/services/ # Services métier
├── Auth/               # Authentification
├── Infrastructure/     # Infrastructure (DB, SMTP)
│   └── Database/       # Base de données
│       ├── prisma/     # Schéma et migrations Prisma
│       ├── generated/  # Client Prisma généré
│       └── client.ts   # Client Prisma
└── Shared/            # Types et utilitaires
```

### Scripts Disponibles
- `npm run dev` : Développement avec hot reload
- `npm run build` : Build de production
- `npm run start` : Démarrage en production

## 🐳 Docker

### Services Inclus
- **PostgreSQL** : Base de données principale
- **MailHog** : Serveur SMTP de test avec interface web

### Interface MailHog
Accédez à http://localhost:8025 pour voir les emails envoyés.

## 📚 Documentation

- [Schéma de Base de Données](docs/database-schema.md)
- [Types TypeScript](src/Shared/database-types.ts)

## 📄 Licence

Ce projet est sous licence ISC.