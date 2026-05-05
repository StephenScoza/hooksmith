import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { exportFormats } from '../../lib/exporters';
import { getPayloadSize } from '../../lib/discord';
import { useWebhookStore } from '../../store/useWebhookStore';
import { Button, Panel, PanelHeader, SmallBadge } from '../ui/FormControls';

export function ExportPanel() {
  const payload = useWebhookStore((state) => state.payload);
  const [activeFormatId, setActiveFormatId] = useState(exportFormats[0].id);
  const [copiedFormatId, setCopiedFormatId] = useState<string | null>(null);

  const activeFormat = useMemo(
    () => exportFormats.find((format) => format.id === activeFormatId) ?? exportFormats[0],
    [activeFormatId]
  );
  const code = useMemo(() => activeFormat.build(payload), [activeFormat, payload]);
  const payloadSize = useMemo(() => getPayloadSize(payload), [payload]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopiedFormatId(activeFormat.id);
    window.setTimeout(() => setCopiedFormatId(null), 1400);
  }

  return (
    <Panel>
      <PanelHeader
        eyebrow="Export"
        title="Implementation-ready snippets"
        description="Use placeholders like WEBHOOK_URL in code, not hard-coded production secrets. Every export uses the current sanitized payload."
        action={
          <Button variant="secondary" onClick={copyCode}>
            {copiedFormatId === activeFormat.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedFormatId === activeFormat.id ? 'Copied' : `Copy ${activeFormat.label}`}
          </Button>
        }
      />

      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {exportFormats.map((format) => (
            <button
              key={format.id}
              type="button"
              onClick={() => setActiveFormatId(format.id)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeFormat.id === format.id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'}`}
            >
              {format.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <SmallBadge>{activeFormat.language}</SmallBadge>
          <SmallBadge>{payloadSize} bytes</SmallBadge>
          <SmallBadge tone="warning">Keep real webhook URLs out of source</SmallBadge>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <pre className="max-h-[460px] overflow-auto rounded-[1.5rem] border border-white/10 bg-[#0f1725] p-4 text-sm leading-7 text-orange-50">
          <code>{code}</code>
        </pre>
      </div>
    </Panel>
  );
}
