"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CefrLevel } from "@/types";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

export function ImportForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<CefrLevel>("A2");
  const [source, setSource] = useState("");
  const [rawText, setRawText] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
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
      const res = await fetch("/api/admin/texts/import", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          level,
          source: source || undefined,
          rawText,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        textId?: string;
        warnings?: string[];
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Import échoué");
        return;
      }

      setStatus("done");
      const warn =
        data.warnings && data.warnings.length > 0
          ? ` Avertissements : ${data.warnings.join(" ")}`
          : "";
      setMessage(`Import réussi.${warn}`);
      if (data.textId) {
        router.push(`/texts/${data.textId}`);
      }
    } catch {
      setStatus("error");
      setMessage("Erreur réseau");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700">Titre</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Niveau</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CefrLevel)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Source (optionnel)</label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Texte russe à importer
        </label>
        <textarea
          required
          rows={12}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Collez un texte russe authentique…"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Secret admin (si configuré sur le serveur)
        </label>
        <input
          type="password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === "loading" ? "Analyse en cours…" : "Importer et analyser"}
      </button>
      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-red-700" : "text-neutral-700"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <p className="text-xs text-neutral-500">
        L&apos;import appelle le moteur d&apos;analyse phrase par phrase. Cela peut prendre
        plusieurs minutes.
      </p>
    </form>
  );
}
