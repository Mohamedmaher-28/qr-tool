import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Link2,
  Download,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { generateQrCode, type GenerateResponse } from "./api";
import { isValidUrl } from "./lib/validate";

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!url.trim()) {
      setStatus("error");
      setErrorMsg("Please enter a valid website URL.");
      return;
    }
    if (!isValidUrl(url)) {
      setStatus("error");
      setErrorMsg("Please enter a valid website URL.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    setCopied(false);

    try {
      const res = await generateQrCode(url.trim());
      if (res.success && res.png) {
        setResult(res);
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(res.error ?? "Failed to generate QR code.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? "Could not reach the server. Please try again."
          : "Something went wrong. Please try again."
      );
    }
  }, [url]);

  const handleDownloadPng = useCallback(() => {
    if (!result?.png) return;
    const link = document.createElement("a");
    link.href = result.png;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  const handleDownloadSvg = useCallback(() => {
    if (!result?.svg) return;
    const blob = new Blob([result.svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "qrcode.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }, [result]);

  const handleCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore clipboard errors (e.g. insecure context) */
    }
  }, [url]);

  const handleReset = useCallback(() => {
    setUrl("");
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
    setCopied(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <div className="app-bg min-h-full w-full flex items-center justify-center px-4 py-10">
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-soft border border-white/60 p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-md mb-4">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              QR Code Generator
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Paste a link, hit generate, and download your QR code.
            </p>
          </div>

          {/* Input + Button */}
          <div className="space-y-4">
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Paste your URL here..."
                aria-label="URL"
                className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={status === "loading"}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </>
              )}
            </motion.button>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-rose-600"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {status === "success" && result && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-8"
              >
                <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    {result.png && (
                      <img
                        src={result.png}
                        alt={`QR code for ${url}`}
                        className="h-56 w-56 object-contain"
                      />
                    )}
                  </motion.div>

                  <p className="mt-5 max-w-full break-all text-center text-sm font-medium text-slate-600">
                    {url.trim()}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={handleDownloadPng}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Download className="h-4 w-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={handleDownloadSvg}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Download className="h-4 w-4" />
                    Download SVG
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-600"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate another QR code
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Built with React, Vite, Tailwind CSS &amp; Framer Motion.
        </p>
      </motion.main>
    </div>
  );
}
