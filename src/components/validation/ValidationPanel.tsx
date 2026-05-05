import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DISCORD_LIMITS } from '../../lib/discord';
import { getValidationIssues } from '../../lib/validation';
import { useWebhookStore } from '../../store/useWebhookStore';
import { Panel, PanelHeader } from '../ui/FormControls';

export function ValidationPanel() {
  const payload = useWebhookStore((state) => state.payload);
  const issues = getValidationIssues(payload);

  return (
    <Panel>
      <PanelHeader
        eyebrow="Validation"
        title="Discord constraints and guidance"
        description="Validation issues never block editing. They stay visible here so you can iterate toward a sendable payload."
      />

      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">No validation issues detected</p>
                  <p className="mt-1 text-emerald-100/80">
                    Your current payload fits the enforced Discord limits checked by Hooksmith.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            issues.map((issue, index) => (
              <div key={`${issue.path}-${index}`} className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">{issue.path}</p>
                    <p className="mt-1 text-rose-100/85">{issue.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm font-medium text-white">Enforced embed limits</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
            <li>Up to {DISCORD_LIMITS.embeds} embeds per message.</li>
            <li>Up to {DISCORD_LIMITS.fields} fields per embed.</li>
            <li>Title up to {DISCORD_LIMITS.title} characters.</li>
            <li>Description up to {DISCORD_LIMITS.description} characters.</li>
            <li>Field name up to {DISCORD_LIMITS.fieldName} characters.</li>
            <li>Field value up to {DISCORD_LIMITS.fieldValue} characters.</li>
            <li>Footer text up to {DISCORD_LIMITS.footerText} characters.</li>
            <li>Author name up to {DISCORD_LIMITS.authorName} characters.</li>
            <li>Total text per embed up to {DISCORD_LIMITS.embedTextTotal} characters.</li>
          </ul>
        </aside>
      </div>
    </Panel>
  );
}
