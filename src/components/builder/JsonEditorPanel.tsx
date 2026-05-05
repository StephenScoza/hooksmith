import { AlertTriangle } from 'lucide-react';
import { useWebhookStore } from '../../store/useWebhookStore';

export function JsonEditorPanel() {
  const jsonDraft = useWebhookStore((state) => state.jsonDraft);
  const jsonError = useWebhookStore((state) => state.jsonError);
  const setJsonDraft = useWebhookStore((state) => state.setJsonDraft);

  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-3">
        <textarea
          value={jsonDraft}
          onChange={(event) => setJsonDraft(event.target.value)}
          spellCheck={false}
          className="h-[720px] w-full resize-y rounded-[1.25rem] border border-white/10 bg-[#09111f] p-4 font-mono text-sm leading-7 text-cyan-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <p className="text-sm leading-6 text-slate-400">
          The JSON editor updates the live payload whenever the JSON parses and validates. Invalid JSON is kept in the
          editor so you can recover without losing work.
        </p>

        {jsonError ? (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">JSON issue</p>
                <p className="mt-1 text-rose-100/85">{jsonError}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
