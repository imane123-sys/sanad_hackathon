# SANAD (سَنَد) — Plateforme de Protection et Solidarité

> **منصة سَنَد** — معاً من أجل أمانكم وتضامنكم  
> **SANAD** — Ensemble pour votre sécurité et votre solidarité.

SANAD est une plateforme numérique innovante dédiée à l'assistance, au soutien et à l'accompagnement des femmes, intégrant un système d'intelligence artificielle éthique, une architecture sécurisée et un support bilingue (Arabe RTL et Français LTR).

---

## 🏗 Architecture du Monorepo

```text
sanad_hackathon/
├── frontend/                     # Application Next.js 16 (App Router, Tailwind CSS, shadcn/ui, i18n RTL)
│   ├── src/
│   │   ├── app/                  # App Router (layout, page d'accueil, globals.css)
│   │   ├── components/           # Composants UI (shadcn/ui Button, Card, Badge, LanguageSwitcher)
│   │   ├── i18n/                 # Configuration multilingue (Arabe RTL / Français LTR, context, traductions)
│   │   └── lib/                  # Utilitaires (cn helper)
│   ├── package.json
│   ├── vitest.config.ts          # Tests unitaires Vitest + React Testing Library
│   └── .env.example
│
├── backend/                      # API REST NestJS 10 (TypeScript, Prisma ORM, Swagger, IA Service)
│   ├── src/
│   │   ├── ai/                   # Couche d'intégration IA indépendante (Gemini Provider, DTOs, Service)
│   │   ├── prisma/               # Service et module de connexion Prisma ORM
│   │   ├── app.controller.ts     # Endpoints système et health probe
│   │   ├── app.module.ts         # Module racine avec ConfigModule & validation globale
│   │   └── main.ts               # Point d'entrée avec CORS, ValidationPipe et Swagger OpenAPI
│   ├── prisma/
│   │   ├── schema.prisma         # Modèles de données (users, ai_interactions)
│   │   └── migrations/           # Scripts de migration SQL initiaux
│   ├── test/                     # Tests E2E Jest
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml            # Service MySQL 8.0 avec volume persistant et healthcheck
├── .env.example                  # Modèle global de variables d'environnement
├── package.json                  # Scripts monorepo racine (dev, build, test, docker, prisma)
└── README.md                     # Documentation complète du projet
```

---

## ⚡ Prérequis

- **Node.js** : v20+ ou v24+
- **npm** : v10+ ou v11+
- **Docker Desktop** : avec le support Docker Compose actif

---

## 🚀 Démarrage Rapide

### 1. Cloner et préparer les variables d'environnement

Copiez les fichiers `.env.example` vers `.env` :

```bash
# Variables d'environnement racine
cp .env.example .env

# Variables d'environnement Backend
cp backend/.env.example backend/.env

# Variables d'environnement Frontend
cp frontend/.env.example frontend/.env.local
```

> **Note sur l'IA (Gemini)** : Renseignez votre clé API Google Gemini dans `backend/.env` via la variable `AI_API_KEY`.

### 2. Démarrer la base de données MySQL avec Docker

```bash
# Démarrer le conteneur MySQL
docker compose up -d

# Vérifier l'état du conteneur et son healthcheck
docker compose ps
```

*Port MySQL hôte configuré par défaut* : `3308` (pour éviter tout conflit avec une instance MySQL locale existante sur le port 3306).

### 3. Appliquer les migrations de base de données (Prisma)

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Démarrer le Backend (NestJS)

```bash
cd backend
npm run start:dev
```

- **API Base URL** : [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Documentation Swagger OpenAPI** : [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Health Check Probe** : [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

### 5. Démarrer le Frontend (Next.js)

```bash
cd frontend
npm run dev
```

- **Application Web** : [http://localhost:3000](http://localhost:3000)

---

## 🌐 Internationalisation & Support RTL (العربية / Français)

L'application intègre un moteur i18n natif avec support complet du RTL (Right-to-Left) :
- **Langue par défaut** : Arabe (`ar`, `dir="rtl"`).
- **Langue secondaire** : Français (`fr`, `dir="ltr"`).
- **Sélecteur de langue dynamique** : Bouton dans l'en-tête permettant de basculer instantanément la langue et l'orientation sans rechargement de page.
- **Fichiers de traduction** :
  - `frontend/src/i18n/translations/ar.json`
  - `frontend/src/i18n/translations/fr.json`

---

## 🤖 Couche d'Intégration IA / LLM

L'architecture IA de SANAD est conçue pour être **indépendante du fournisseur (provider-independent)** :

- **Interface Abstraite** : `AiProvider` (`backend/src/ai/interfaces/ai-provider.interface.ts`) définissant `generateText()`.
- **Fournisseur Actif** : Google Gemini via le SDK officiel `@google/generative-ai`.
- **Aucune réponse fictive (no mock)** : Appels réels au modèle configuré avec gestion des exceptions et journalisation en base de données.
- **Variables d'environnement** :
  - `AI_PROVIDER=gemini`
  - `AI_MODEL=gemini-1.5-pro`
  - `AI_API_KEY=your_api_key_here`
  - `AI_TEMPERATURE=0.7`
  - `AI_MAX_OUTPUT_TOKENS=2048`
- **Endpoint de test IA** : `POST /api/v1/ai/generate` et `GET /api/v1/ai/status` documentés dans Swagger.

---

## 🧪 Tests et Vérification de la Qualité

### Frontend (Vitest & React Testing Library)
```bash
cd frontend
npm run test
```

### Backend (Jest & Supertest E2E)
```bash
cd backend
npm run test        # Tests unitaires
npm run test:e2e    # Tests End-to-End
```

### Monorepo (depuis la racine)
```bash
npm run test        # Lance les tests backend puis frontend
npm run build       # Compile backend puis frontend
```

---

## 🔒 Sécurité et Bonnes Pratiques

- **Validation des requêtes** : `ValidationPipe` global avec `class-validator` et `class-transformer` (filtrage strict des propriétés non autorisées).
- **Protection CORS** : Contrôle strict de l'origine Next.js vers NestJS.
- **Gestion des secrets** : Les clés API et identifiants de base de données sont externalisés dans les fichiers `.env` ignorés par Git.
