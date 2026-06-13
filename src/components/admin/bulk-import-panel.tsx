"use client";

import { useState } from "react";

import type { CefrLevel } from "@/types";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

type BulkProgress = {
  jobId: string;
  status: string;
  filesImported: number;
  totalFiles: number;
  remainingFiles: number;
  knowledgeHits: number;
  aiCalls: number;
  skippedDuplicates: number;
};

export function BulkImportPanel() {
  const [folderPath, setFolderPath] = useState("");
  const [jobName, setJobName] = useState("");
  const [level, setLevel] = useState<CefrLevel>("B1");
  const [adminSecret, setAdminSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [progress, setProgress] = useState<BulkProgress | null>(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminSecret.trim()) {
      headers.Authorization = `Bearer ${adminSecret.trim()}`;
    }

    try {
      const res = await fetch("/api/admin/import/bulk", {
        method: "POST",
        headers,
        body: JSON.stringify({
          jobName: jobName || `Corpus ${new Date().toISOString().slice(0, 10)}`,
          folderPath,
          level,
          runImmediately: true,
        }),
      });

      const data = (await res.json()) as { error?: string; progress?: BulkProgress; jobId?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Échec de l'import bulk");
        return;
      }

      setProgress(data.progress ?? null);
      setStatus("done");
      setMessage(`Import terminé — job ${data.jobId ?? ""}`);
    } catch {
      setStatus("error");
      setMessage("Erreur réseau");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Import corpus (bulk)</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Importe un dossier entier via le pipeline existant — doublons ignorés, reprise possible.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Chemin du dossier</label>
        <input
          required
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="/chemin/vers/corpus"
          className="focus-kb mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-neutral-500">Fichiers .txt et .md — exécution serveur (CLI ou API).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Nom du job</label>
          <input
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="focus-kb mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Niveau</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CefrLevel)}
            className="focus-kb mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Secret admin</label>
        <input
          type="password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          className="focus-kb mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800 disabled:opacity-50"
      >
        {status === "loading" ? "Import en cours…" : "Lancer l'import bulk"}
      </button>

      {message ? (
        <p className={`text-sm ${status === "error" ? "text-red-700" : "text-neutral-700"}`}>
          {message}
        </p>
      ) : null}

      {progress ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
          <p>
            <span className="font-medium">{progress.filesImported}</span> / {progress.totalFiles}{" "}
            fichiers · {progress.remainingFiles} restants
          </p>
          <p className="mt-1 text-neutral-600">
            Cache {progress.knowledgeHits} · IA {progress.aiCalls} · Doublons{" "}
            {progress.skippedDuplicates}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-neutral-500">
        Pour de très grands corpus (10 000+ textes), préférez{" "}
        <code className="rounded bg-neutral-100 px-1">npm run import:bulk</code> en CLI.
      </p>
    </form>
  );
}
