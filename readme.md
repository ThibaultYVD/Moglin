# 📬 Moglin

API REST en **Node.js / TypeScript** qui permet d’envoyer des emails via **SMTP**.  

---

## Installation

```bash
# Cloner le repo
git clone https://github.com/ton-org/moglin.git
cd moglin

# Installer les dépendances
npm install
```

## Configuration
Créer un fichier `.env` à la racine :
```env
PORT=3000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="Mon App <no-reply@example.com>"
```

PORT : port HTTP de l’API
SMTP_HOST / SMTP_PORT : serveur SMTP (MailHog, provider, etc.)
SMTP_SECURE : true si SMTPS (465), false sinon (587, 25, 1025…)
SMTP_USER / SMTP_PASS : identifiants SMTP (laisser vide avec MailHog)
FROM_EMAIL : expéditeur par défaut

## Environnement de développement
Lancer MailHog avec Docker : `docker compose up -d`
UI disponible sur : http://localhost:8025

## Démarrage de l'API
```bash
# Run en dev
npm run dev

# Build + start
npm run build
npm start
```
L’API sera accessible sur : http://localhost:3000
