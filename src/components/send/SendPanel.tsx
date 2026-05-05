import { AlertTriangle, LoaderCircle, SendHorizonal, ShieldAlert } from 'lucide-react';
import { sanitizePayload } from '../../lib/discord';
import { getValidationIssues } from '../../lib/validation';
import { useWebhookStore } from '../../store/useWebhookStore';
import { Button, Panel, PanelHeader, TextInput } from '../ui/FormControls';

export function SendPanel() {
  const payload = useWebhookStore((state) => state.payload);
  const webhookUrl = useWebhookStore((state) => state.webhookUrl);
  const sendState = useWebhookStore((state) => state.sendState);
  const setWebhookUrl = useWebhookStore((state) => state.setWebhookUrl);
  const setSendState = useWebhookStore((state) => state.setSendState);

  const validationIssues = getValidationIssues(payload);

  async function sendTestWebhook() {
    if (!webhookUrl.trim()) {
      setSendState({
        status: 'error',
        message: 'Paste a Discord webhook URL before sending a test message.'
      });
      return;
    }

    setSendState({
      status: 'sending',
      message: 'Sending test payload to Discord...'
    });

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizePayload(payload))
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `${response.status} ${response.statusText}`);
      }

      setSendState({
        status: 'success',
        message: 'Webhook sent successfully.'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown request error.';
      setSendState({
        status: 'error',
        message
      });
    }
  }

  return (
    <Panel>
      <PanelHeader
        eyebrow="Test Send"
        title="Send the current payload to Discord"
        description="The webhook URL stays client-side in this session only and is intentionally not persisted to localStorage."
      />

      <div className="space-y-5 p-5 sm:p-6">
        <div className="rounded-3xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50/90">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="font-semibold text-amber-100">Treat webhook URLs like passwords</p>
              <p className="mt-1">
                Do not store them in source control, analytics, screenshots, bug reports, or shared docs. Rotate the URL in
                Discord immediately if you think it was exposed.
              </p>
            </div>
          </div>
        </div>

        <TextInput
          label="Discord webhook URL"
          hint="Pasted here for this session only."
          value={webhookUrl}
          onChange={(event) => setWebhookUrl(event.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
        />

        {validationIssues.length ? (
          <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Validation warnings detected</p>
                <p className="mt-1 text-rose-100/85">
                  You can still keep editing, but fixing validation issues before sending will avoid Discord API errors.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={sendTestWebhook} disabled={sendState.status === 'sending'}>
            {sendState.status === 'sending' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
            {sendState.status === 'sending' ? 'Sending...' : 'Send test webhook'}
          </Button>
          <p className="text-sm text-slate-400">Discord may respond with 204 No Content on success.</p>
        </div>

        {sendState.message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              sendState.status === 'error'
                ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
                : sendState.status === 'success'
                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                  : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
            }`}
          >
            {sendState.message}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
