import { Braces, RotateCcw } from 'lucide-react';
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

  return (
    <Panel>
      <PanelHeader
        eyebrow="Builder"
        title="Compose the webhook payload"
        description="Switch between a guided visual builder and direct JSON editing. Your payload stays local in the browser and is restored from localStorage."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={resetPayload}>
              <RotateCcw className="h-4 w-4" />
              Reset
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

        <div className="flex flex-wrap items-center gap-2">
          <SmallBadge>Templates</SmallBadge>
          {payloadTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
              title={template.description}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {builderTab === 'visual' ? <VisualEditor /> : <JsonEditorPanel />}
    </Panel>
  );
}
