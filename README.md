# QR Code Generator

A modern, fast, and responsive single-page **QR Code Generator** built with a
React 19 + Vite + Tailwind frontend and a Node.js + Express + TypeScript backend.

Paste a URL, generate a QR code instantly, and download it as **PNG** or **SVG**
or copy the link. No login required. Firebase is optional and only used if you
later decide to persist generated QR codes.

## Tech Stack

| Layer     | Technologies                                                        |
| --------- | ------------------------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS, Axios, Framer Motion, Lucide Icons |
| Backend   | Node.js, Express.js, TypeScript, `qrcode`                           |
| Database  | Firebase Firestore (optional)                                       |

## Project Structure

```
Qr-Tool/
├── frontend/   # React 19 SPA
├── backend/    # Express API
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 recommended)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # optional, fill in Firebase values only if needed
npm run dev            # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional, fill in Firebase values only if needed
npm run dev            # starts on http://localhost:5173
```

The frontend dev server proxies `/api` requests to the backend on port `4000`,
so everything works out of the box.

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## API

### `POST /generate`

Request:

```json
{
  "url": "https://example.com"
}
```

Response (success):

```json
{
  "success": true,
  "format": "png",
  "png": "data:image/png;base64,...",
  "svg": "<svg ...>...</svg>"
}
```

Response (error):

```json
{
  "success": false,
  "error": "Please enter a valid website URL (http or https)."
}
```

## Features

- ✅ Single-page, fully responsive UI
- ✅ Instant QR generation via the backend (`qrcode` package)
- ✅ Download as PNG and SVG
- ✅ Copy the original URL to clipboard
- ✅ Client + server side URL validation
- ✅ Friendly error messages for empty / invalid input
- ✅ Smooth Framer Motion animations, rounded cards, soft shadows
- ✅ Generate another code without page reload
- ✅ Firebase ready (optional, no auth required)

## Environment Variables

See `.env.example` in each folder:

**Frontend** (`frontend/.env.example`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=/api
```

**Backend** (`backend/.env.example`)

```
PORT=4000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

> Firebase is **not** required for the app to work. The frontend only
> initializes Firebase when the relevant config values are present.

## Notes

- No authentication or login is used.
- Firebase Firestore can be added later to store a history of generated codes.
