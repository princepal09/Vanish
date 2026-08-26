<div align="center">

# 🔥 Vanish

### Secrets that self-destruct.

A privacy-first, ephemeral secret-sharing platform with **military-grade AES-256-GCM encryption**, **atomic burn-after-reading**, and **zero-knowledge architecture**.

Create a secret → Share the link → It vanishes after being read. Forever.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/en-us/sql-server)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🗄️ Database Setup](#️-database-setup)
- [🔌 API Reference](#-api-reference)
- [🔐 Security](#-security)
- [📜 Available Scripts](#-available-scripts)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🔗 **One-Time Secret Links** | Cryptographically random 32-byte hex URL tokens — each link works exactly once |
| 🔒 **AES-256-GCM Encryption** | Secrets encrypted at rest with unique per-note IVs and authentication tags |
| ⚛️ **Atomic Burn-After-Reading** | SQL Server `DELETE ... OUTPUT` ensures zero race conditions — even concurrent requests can't double-read |
| 🔑 **Passphrase Protection** | Optional bcrypt-hashed passphrases (12 salt rounds) with auto-destruction after 5 failed attempts |
| ⏰ **Configurable Expiry** | Choose from `5 minutes`, `1 hour`, `24 hours`, or `7 days` — expired notes are auto-purged |
| 🧹 **Background Auto-Purge** | A recurring 60-second cleanup job sweeps and destroys expired secrets |
| 📊 **Live Dashboard** | Real-time telemetry — notes created, burned, expired, and currently alive |
| 🛡️ **Rate Limiting** | Note creation throttled to 5 requests/minute per IP to prevent abuse |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│     Client (React 19 / Vite)    │
│   http://localhost:5173         │
└──────────────┬──────────────────┘
               │  Axios HTTP
               ▼
┌─────────────────────────────────┐
│    Server (Express 5 / Node)    │
│   http://localhost:5000         │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │ AES-256   │  │  Bcrypt    │  │
│  │ Encrypt / │  │  Passphrase│  │
│  │ Decrypt   │  │  Hashing   │  │
│  └───────────┘  └────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Background Cleanup Job   │  │
│  │  (every 60s)              │  │
│  └───────────────────────────┘  │
└──────────────┬──────────────────┘
               │  mssql driver
               ▼
┌─────────────────────────────────┐
│     Microsoft SQL Server        │
│     Database: VanishDB          │
│                                 │
│  ┌────────────┐ ┌────────────┐  │
│  │ dbo.Notes  │ │dbo.Note    │  │
│  │            │ │  Events    │  │
│  └────────────┘ └────────────┘  │
└─────────────────────────────────┘
```

### Data Flow

1. **Create** — Client submits a secret → Server generates a crypto token, encrypts payload with AES-256-GCM, optionally hashes a passphrase, persists to `dbo.Notes`, logs a `CREATED` event, and returns a shareable URL.
2. **Check** — Recipient opens the link → Server verifies the token exists and whether a passphrase is required.
3. **Reveal** — Recipient confirms → Server atomically deletes the row (`DELETE ... OUTPUT DELETED.*`), decrypts the payload, logs a `BURNED` event, and returns the plaintext. The secret is gone permanently.
4. **Expire** — Background job runs every 60s → Deletes expired notes and logs `EXPIRED` events.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
| :--- | :--- |
| **React 19** | UI framework with React Compiler optimization |
| **TypeScript 6** | Type safety |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **React Hook Form + Zod** | Form handling and validation |
| **Axios** | HTTP client |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |
| **shadcn/ui** | UI component primitives |
| **Oxlint** | Linting |

### Backend

| Technology | Purpose |
| :--- | :--- |
| **Express 5** | Web framework |
| **TypeScript 7** | Type safety |
| **tsx** | TypeScript execution & watch mode |
| **mssql** | SQL Server database driver |
| **bcrypt** | Passphrase hashing (12 rounds) |
| **Node.js crypto** | AES-256-GCM encryption |
| **express-rate-limit** | API rate limiting |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment configuration |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** (v9 or later)
- **Microsoft SQL Server** (Express edition or higher)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/princepal09/Vanish.git
   cd Vanish
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies (concurrently)
   npm install

   # Install client dependencies
   npm install --prefix client

   # Install server dependencies
   npm install --prefix server
   ```

3. **Set up environment variables** (see [Environment Variables](#️-environment-variables))

4. **Set up the database** (see [Database Setup](#️-database-setup))

5. **Start development servers**

   ```bash
   npm run dev
   ```

   This launches both the client (`http://localhost:5173`) and server (`http://localhost:5000`) concurrently.

---

## ⚙️ Environment Variables

### Client — `client/.env`

| Variable | Example | Description |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | `http://localhost:5000/api/v1` | Backend API base URL |

### Server — `server/.env`

| Variable | Example | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Server port (default: `8000`) |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin for CORS |
| `FRONTEND_URL` | `http://localhost:5173` | Used to construct shareable note links |
| `DB_USER` | `vanish_user` | SQL Server username |
| `DB_PASSWORD` | `your_secure_password` | SQL Server password |
| `DB_SERVER` | `localhost` | SQL Server host |
| `DB_DATABASE` | `VanishDB` | Database name |
| `DB_INSTANCE` | `SQLEXPRESS` | SQL Server instance name |
| `DB_ENCRYPT` | `true` | Enable connection encryption |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` | Trust self-signed SSL certs (dev only) |
| `ENCRYPTION_KEY` | `64-char hex string` | **32-byte AES master key** — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

> [!CAUTION]
> Never commit your `.env` files or share your `ENCRYPTION_KEY`. If the key is lost, all encrypted notes become permanently unreadable.

---

## 🗄️ Database Setup

Connect to your SQL Server instance and run the following to create the database and tables:

```sql
-- Create database
CREATE DATABASE VanishDB;
GO

USE VanishDB;
GO

-- Notes table
CREATE TABLE dbo.Notes (
    id                UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWID()  PRIMARY KEY,
    token             NVARCHAR(128)     NOT NULL  UNIQUE,
    encryptedPayload  VARBINARY(MAX)    NOT NULL,
    iv                VARBINARY(32)     NOT NULL,
    authTag           VARBINARY(32)     NOT NULL,
    expiresAt         DATETIME2         NOT NULL,
    createdAt         DATETIME2         NOT NULL  DEFAULT SYSUTCDATETIME(),
    readAt            DATETIME2         NULL,
    passphraseHash    NVARCHAR(255)     NULL,
    failedAttempts    INT               NOT NULL  DEFAULT 0  CHECK (failedAttempts >= 0)
);
GO

-- Index for efficient expiry cleanup
CREATE INDEX IX_Notes_ExpiresAt ON dbo.Notes (expiresAt);
GO

-- Events table for telemetry
CREATE TABLE dbo.NoteEvents (
    token      NVARCHAR(128)  NOT NULL,
    eventType  NVARCHAR(20)   NOT NULL  -- 'CREATED', 'BURNED', 'EXPIRED'
);
GO
```

---

## 🔌 API Reference

Base URL: `/api/v1`

### Health & Status

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status check |
| `GET` | `/api/health` | Health check endpoint |

### Notes

#### `POST /api/v1/notes` — Create a secret note

> Rate limited: **5 requests per minute** per IP

**Request Body:**
```json
{
  "secret": "my confidential message",
  "expiry": "1h",
  "passphrase": "optional-passphrase"
}
```

| Field | Type | Required | Values |
| :--- | :--- | :--- | :--- |
| `secret` | `string` | ✅ | The secret content |
| `expiry` | `string` | ✅ | `5m` · `1h` · `24h` · `7d` |
| `passphrase` | `string` | ❌ | Optional access passphrase |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "token": "a1b2c3...",
    "expiresAt": "2026-08-27T10:00:00.000Z",
    "url": "http://localhost:5173/note/a1b2c3..."
  },
  "message": "Note created successfully"
}
```

---

#### `GET /api/v1/notes/:token` — Check note availability

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { "requiresPassphrase": true },
  "message": "Note is available"
}
```

| Status | Meaning |
| :--- | :--- |
| `404` | Note not found, already burned, or expired |

---

#### `POST /api/v1/notes/:token/reveal` — Reveal and destroy

**Request Body:**
```json
{
  "passphrase": "your-passphrase"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { "secret": "my confidential message" },
  "message": "Note revealed and destroyed"
}
```

| Status | Meaning |
| :--- | :--- |
| `401` | Wrong passphrase (shows remaining attempts) |
| `404` | Already burned or not found |
| `410` | Max attempts reached — note destroyed |

---

### Dashboard

#### `GET /api/v1/dashboard` — Usage statistics

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "totalCreated": 142,
    "totalBurned": 98,
    "totalExpired": 31,
    "currentlyAlive": 13
  }
}
```

---

## 🔐 Security

| Layer | Implementation |
| :--- | :--- |
| **Encryption at Rest** | AES-256-GCM with unique 12-byte IVs and authentication tags per note |
| **Atomic Burn** | SQL Server `DELETE ... OUTPUT DELETED.*` prevents race conditions — verified with concurrent stress tests (20 simultaneous requests) |
| **Passphrase Hashing** | bcrypt with 12 salt rounds |
| **Brute Force Protection** | Notes are permanently destroyed after 5 incorrect passphrase attempts |
| **Rate Limiting** | 5 requests/minute per IP on note creation |
| **Auto-Expiry** | Background purge job runs every 60 seconds |
| **CORS** | Strict origin-based access control |

---

## 📜 Available Scripts

### Root (run both client & server)

```bash
npm run dev          # Start both dev servers concurrently
```

### Client

```bash
npm run dev --prefix client       # Vite dev server
npm run build --prefix client     # Production build
npm run lint --prefix client      # Run Oxlint
npm run preview --prefix client   # Preview production build
```

### Server

```bash
npm run dev --prefix server       # Start with tsx watch mode
npm run build --prefix server     # Compile TypeScript
npm run start --prefix server     # Run production build
npm run test:atomic --prefix server   # Atomic burn concurrency test
```

---

## 📁 Project Structure

```
Vanish/
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/                # Axios client & API functions
│   │   ├── components/         # Reusable UI components (Navbar, CopyButton, etc.)
│   │   │   └── ui/             # shadcn/ui primitives
│   │   ├── lib/                # Utility functions
│   │   ├── pages/              # Route pages (CreateNote, RevealNote, Dashboard)
│   │   ├── types/              # TypeScript type definitions
│   │   ├── App.tsx             # Router & layout
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── public/                 # Static assets
│   ├── index.html              # HTML entry
│   ├── vite.config.ts          # Vite configuration
│   ├── components.json         # shadcn/ui config
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # Database & app configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── database/           # SQL schema & initialization
│   │   ├── middleware/         # Rate limiting & error handling
│   │   ├── routes/             # API route definitions
│   │   ├── scripts/            # Test scripts (atomic reveal)
│   │   ├── services/           # Business logic & encryption
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Helper utilities
│   │   ├── app.ts              # Express app setup
│   │   └── index.ts            # Server entry point
│   └── package.json
│
├── package.json                # Root scripts (concurrently)
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

<div align="center">

**Built with 🔥 by [princepal09](https://github.com/princepal09)**

*Your secrets deserve to vanish.*

</div>
