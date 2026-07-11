import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Basic in-memory request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "QR Tool API is running" });
});

interface GenerateBody {
  url?: unknown;
}

interface GenerateResponse {
  success: boolean;
  qrCode?: string;
  format?: "png" | "svg";
  error?: string;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// POST /generate (or /api/generate when served as a single host)
// Body: { "url": "https://example.com" }
// Response: { success: true, qrCode: "base64_or_svg_data", format: "png" | "svg" }
async function handleGenerate(req: Request, res: Response): Promise<void> {
    const { url } = (req.body ?? {}) as GenerateBody;

    if (typeof url !== "string" || url.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Please provide a URL in the request body.",
      } satisfies GenerateResponse);
      return;
    }

    if (!isValidHttpUrl(url.trim())) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid website URL (http or https).",
      } satisfies GenerateResponse);
      return;
    }

    try {
      const safeUrl = url.trim();

      // Generate PNG as a base64 data URL
      const pngDataUrl = await QRCode.toDataURL(safeUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 512,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      // Generate SVG string as well so the client can offer both downloads
      const svgString = await QRCode.toString(safeUrl, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      const response: GenerateResponse & { png: string; svg: string } = {
        success: true,
        format: "png",
        png: pngDataUrl,
        svg: svgString,
      };

      res.json(response);
    } catch (err) {
      console.error("QR generation failed:", err);
      res.status(500).json({
        success: false,
        error: "Failed to generate QR code. Please try again.",
      } satisfies GenerateResponse);
    }
  };

app.post("/generate", handleGenerate);
app.post("/api/generate", handleGenerate);

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error." });
});

// Serve the built frontend (production / hosting mode).
// In development the Vite dev server handles the UI and proxies /api to this server.
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  const mode = fs.existsSync(frontendDist) ? "hosting (SPA + API)" : "API only";
  console.log(`QR Tool server (${mode}) listening on http://localhost:${PORT}`);
});
