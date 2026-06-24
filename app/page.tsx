"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function fireHello() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/test-hello", { method: "POST" });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        Reusable Workflow Builder
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Day 1 scaffold — Next.js · Prisma · Inngest · AI SDK · React Flow
      </p>

      <button
        onClick={fireHello}
        disabled={loading}
        className="mt-8 w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending…" : "ยิง hello-world event"}
      </button>

      {result && (
        <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {result}
        </pre>
      )}

      <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
        กดปุ่มแล้วไปดูใน Inngest dev dashboard (
        <code className="font-mono">http://localhost:8288</code>) ว่า function{" "}
        <code className="font-mono">hello-world</code> รันหรือยัง
      </p>
    </main>
  );
}
