import { Braces, RotateCcw, Trash2 } from 'lucide-react';
import { payloadTemplates } from '../../lib/templates';
import { useWebhookStore } from '../../store/useWebhookStore';
import { Button, Panel, PanelHeader, SmallBadge } from '../ui/FormControls';
import { JsonEditorPanel } from './JsonEditorPanel';
import { VisualEditor } from './VisualEditor';

export function BuilderPanel() {
  const builderTab = useWebhookStore((state) => state.builderTab);
  const setBuilderTab = useWebhookStore((state) => state.setBuilderTab);
  const applyTemplate = useWebhookStore((state) => state.applyTemplate);
  const resetPayload = useWebhookStore((state) => state.resetPayload);
  const wipeLocalDraft = useWebhookStore((state) => state.wipeLocalDraft);
  const lastSavedAt = useWebhookStore((state) => state.lastSavedAt);

  const savedTimeLabel = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(lastSavedAt);

  return (
    <Panel>
      <PanelHeader
        eyebrow="Builder"
        title="Compose the webhook payload"
        description="Switch between a guided visual builder and direct JSON editing. Your payload stays local in the browser and is restored from localStorage."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SmallBadge tone="success">Saved locally at {savedTimeLabel}</SmallBadge>
            <Button variant="secondary" onClick={resetPayload}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="ghost" onClick={wipeLocalDraft}>
              <Trash2 className="h-4 w-4" />
              Wipe local draft
            </Button>
          </div>
        }
      />

      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBuilderTab('visual')}
            className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${builderTab === 'visual' ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'}`}
          >
            Visual builder
          </button>
          <button
            type="button"
            onClick={() => setBuilderTab('json')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${builderTab === 'json' ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'}`}
          >
            <Braces className="h-4 w-4" />
            JSON editor
          </button>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <SmallBadge>Templates</SmallBadge>
            <p className="text-sm text-slate-400">Start from common webhook patterns instead of building every payload from scratch.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {payloadTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-orange-400/40 hover:bg-orange-400/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{template.description}</p>
                  </div>
                  <SmallBadge>Use</SmallBadge>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {builderTab === 'visual' ? <VisualEditor /> : <JsonEditorPanel />}
    </Panel>
  );
}
