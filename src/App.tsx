import { AlertTriangle, Code2, HardDriveDownload, Hammer, ShieldAlert, WandSparkles } from 'lucide-react';
import { getPayloadSize } from './lib/discord';
import { getValidationIssues } from './lib/validation';
import { BuilderPanel } from './components/builder/BuilderPanel';
import { ExportPanel } from './components/export/ExportPanel';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { SendPanel } from './components/send/SendPanel';
import { ValidationPanel } from './components/validation/ValidationPanel';
import { useWebhookStore } from './store/useWebhookStore';

export default function App() {
  const payload = useWebhookStore((state) => state.payload);
  const payloadSize = getPayloadSize(payload);
  const validationIssueCount = getValidationIssues(payload).length;
  const fieldCount = payload.embeds.reduce((total, embed) => total + embed.fields.length, 0);

  return (
    <main className="min-h-screen bg-[#08111f] text-slate-100">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-8 shadow-2xl shadow-slate-950/40 backdrop-blur xl:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),transparent_35%,rgba(244,114,182,0.08))]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-cyan-200">
                <Hammer className="h-4 w-4" />
                Hooksmith
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl xl:text-6xl">
                Production-ready Discord webhook and embed payloads, without hand-authoring every key.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Build visually, tune raw JSON, preview the result in a Discord-style layout, validate against official
                webhook constraints, and export implementation-ready code for your stack.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 inline-flex rounded-xl bg-cyan-400/10 p-2 text-cyan-200">
                    <WandSparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">Visual-first builder</p>
                  <p className="mt-1 text-sm text-slate-400">Embeds, fields, media, colors, metadata, and templates.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 inline-flex rounded-xl bg-indigo-400/10 p-2 text-indigo-200">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">Export engine</p>
                  <p className="mt-1 text-sm text-slate-400">JSON, cURL, fetch, Node.js, Python, Go, PHP, C#, and Java.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 inline-flex rounded-xl bg-amber-400/10 p-2 text-amber-200">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">Client-side only</p>
                  <p className="mt-1 text-sm text-slate-400">No login, no backend, no stored webhook secrets.</p>
                </div>
              </div>
            </div>

            <aside className="grid gap-3 xl:w-[360px]">
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-200" />
                  <div>
                    <p className="text-sm font-semibold text-amber-100">Webhook URLs are secrets</p>
                    <p className="mt-1 text-sm leading-6 text-amber-50/80">
                      Keep them client-side only. Don&apos;t paste production URLs into screenshots, commits, docs, or chats.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Embeds</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{payload.embeds.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fields</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{fieldCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Payload</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <HardDriveDownload className="h-4 w-4 text-cyan-300" />
                    {payloadSize} bytes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Validation</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <AlertTriangle className={`h-4 w-4 ${validationIssueCount ? 'text-amber-300' : 'text-emerald-300'}`} />
                    {validationIssueCount ? `${validationIssueCount} issue${validationIssueCount === 1 ? '' : 's'}` : 'Clean'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Storage</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldAlert className="h-4 w-4 text-emerald-300" />
                    Local only
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <div className="space-y-6">
            <BuilderPanel />
            <ValidationPanel />
          </div>

          <div className="space-y-6">
            <PreviewPanel />
            <ExportPanel />
            <SendPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
