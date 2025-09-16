import { PrismaClient } from '../generated/prisma/index.js';
import { randomBytes, createHash } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer une clé API de test
  const testApiKey = 'test-key-' + randomBytes(16).toString('hex');
  const salt = randomBytes(16).toString('hex');
  const keyHash = createHash('sha256').update(testApiKey + salt).digest('hex');

  const apiKey = await prisma.apiKey.create({
    data: {
      name: 'Test API Key',
      keyHash,
      salt,
      scopes: ['email:send', 'email:read'],
      status: 'ACTIVE',
      rateLimit: 100, // 100 emails par minute
      description: 'Clé API de test pour le développement',
    },
  });

  console.log('✅ API Key créée:', apiKey.id);
  console.log('🔑 Clé API de test:', testApiKey);

  // Créer un template d'email de test
  const template = await prisma.emailTemplate.upsert({
    where: { name: 'welcome-email' },
    update: {},
    create: {
      name: 'welcome-email',
      subject: 'Bienvenue {{userName}} !',
      bodyHtml: `
        <h1>Bienvenue {{userName}} !</h1>
        <p>Merci de vous être inscrit sur notre plateforme.</p>
        <p>Votre email de confirmation est : {{email}}</p>
        <p>À bientôt !</p>
      `,
      bodyText: `
        Bienvenue {{userName}} !
        
        Merci de vous être inscrit sur notre plateforme.
        Votre email de confirmation est : {{email}}
        
        À bientôt !
      `,
      status: 'ACTIVE',
      variables: ['userName', 'email'],
      description: 'Template d\'email de bienvenue',
      category: 'onboarding',
    },
  });

  console.log('✅ Template créé:', template.id);

  // Créer un webhook de test
  const webhook = await prisma.webhook.create({
    data: {
      name: 'Test Webhook',
      url: 'https://webhook.site/your-unique-url',
      events: ['DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED'],
      status: 'ACTIVE',
      secret: 'webhook-secret-' + randomBytes(16).toString('hex'),
      timeout: 30,
      retryCount: 3,
      description: 'Webhook de test pour recevoir les événements',
    },
  });

  console.log('✅ Webhook créé:', webhook.id);

  console.log('🎉 Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
