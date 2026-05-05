import { Plus, Sparkles } from 'lucide-react';
import { DISCORD_LIMITS, getCharacterLimitMessage } from '../../lib/discord';
import { useWebhookStore } from '../../store/useWebhookStore';
import { EmbedCardEditor } from './EmbedCardEditor';
import { Button, EmptyState, PanelHeader, SmallBadge, TextInput, TextareaInput, ToggleInput } from '../ui/FormControls';

type MessagePreset = {
  id: string;
  name: string;
  description: string;
  content: string;
  username: string;
  avatar_url: string;
  tts: boolean;
};

const messagePresets: MessagePreset[] = [
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'High-visibility launch or community update with a broad callout.',
    content: '@everyone A new update just landed.',
    username: 'Hooksmith',
    avatar_url: '',
    tts: false
  },
  {
    id: 'quiet-update',
    name: 'Quiet update',
    description: 'Routine status change without alert-style urgency.',
    content: 'Heads up: the latest rollout checkpoint has been completed successfully.',
    username: 'Release Bot',
    avatar_url: '',
    tts: false
  },
  {
    id: 'incident-alert',
    name: 'Incident alert',
    description: 'Operational message shell for active incidents or degraded service.',
    content: '<!here> Investigating elevated delivery failures.',
    username: 'Ops Watch',
    avatar_url: '',
    tts: false
  },
  {
    id: 'welcome',
    name: 'Welcome',
    description: 'Friendly onboarding message for new members.',
    content: 'Welcome to the server. Start here and get settled in.',
    username: 'Community Guide',
    avatar_url: '',
    tts: false
  },
  {
    id: 'voice-broadcast',
    name: 'Voice broadcast',
    description: 'Text-to-speech message shell for urgent spoken delivery.',
    content: 'Attention: this is an urgent service notification.',
    username: 'Alert Relay',
    avatar_url: '',
    tts: true
  }
];

export function VisualEditor() {
  const payload = useWebhookStore((state) => state.payload);
  const updateRoot = useWebhookStore((state) => state.updateRoot);
  const addEmbed = useWebhookStore((state) => state.addEmbed);
  const replacePayload = useWebhookStore((state) => state.replacePayload);

  function applyMessagePreset(preset: MessagePreset) {
    replacePayload({
      ...payload,
      content: preset.content,
      username: preset.username,
      avatar_url: preset.avatar_url,
      tts: preset.tts
    });
  }

  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-[color:rgba(249,115,22,0.18)] bg-[color:rgba(249,115,22,0.06)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-300" />
                <p className="text-sm font-medium text-white">Message shell presets</p>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Swap the webhook voice, top-line message, and TTS behavior without replacing the embeds you have already built.
              </p>
            </div>
            <SmallBadge>{messagePresets.length} presets</SmallBadge>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {messagePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyMessagePreset(preset)}
                className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-left transition hover:border-orange-400/40 hover:bg-slate-950/80"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{preset.name}</p>
                  <SmallBadge>{preset.tts ? 'TTS' : 'Apply'}</SmallBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{preset.description}</p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-300">{preset.content}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <TextareaInput
            label="content"
            hint="Plain message content that appears above embeds."
            counter={`${payload.content?.length ?? 0}/${DISCORD_LIMITS.content}`}
            error={getCharacterLimitMessage(payload.content?.length ?? 0, DISCORD_LIMITS.content)}
            value={payload.content ?? ''}
            onChange={(event) => updateRoot('content', event.target.value)}
            placeholder="Write the message body that should accompany your embeds."
            className="min-h-[140px]"
          />

          <div className="grid gap-4">
            <TextInput
              label="username"
              hint="Optional webhook display name override."
              counter={`${payload.username?.length ?? 0}/${DISCORD_LIMITS.username}`}
              error={getCharacterLimitMessage(payload.username?.length ?? 0, DISCORD_LIMITS.username)}
              value={payload.username ?? ''}
              onChange={(event) => updateRoot('username', event.target.value)}
              placeholder="Hooksmith"
            />
            <TextInput
              label="avatar_url"
              hint="Public HTTPS image URL for the webhook avatar."
              value={payload.avatar_url ?? ''}
              onChange={(event) => updateRoot('avatar_url', event.target.value)}
              placeholder="https://images.example.com/avatar.png"
            />
            <ToggleInput
              label="tts"
              hint="Enable Discord text-to-speech delivery for the message content."
              checked={Boolean(payload.tts)}
              onChange={(checked) => updateRoot('tts', checked)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
          <div>
            <p className="text-sm font-medium text-white">Embeds</p>
            <p className="mt-1 text-sm text-slate-400">
              Discord allows up to {DISCORD_LIMITS.embeds} embeds per message. Use multiple cards for richer layouts or
              multi-part updates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SmallBadge>{payload.embeds.length}/{DISCORD_LIMITS.embeds}</SmallBadge>
            <Button onClick={addEmbed} disabled={payload.embeds.length >= DISCORD_LIMITS.embeds}>
              <Plus className="h-4 w-4" />
              Add embed
            </Button>
          </div>
        </div>

        {payload.embeds.length === 0 ? (
          <EmptyState
            title="No embeds yet"
            description="Add an embed to start designing cards with titles, descriptions, media, authors, and fields."
          />
        ) : null}

        <div className="space-y-5">
          {payload.embeds.map((embed, embedIndex) => (
            <EmbedCardEditor key={embedIndex} embed={embed} embedIndex={embedIndex} />
          ))}
        </div>

        <div className="rounded-3xl border border-orange-400/15 bg-orange-400/5 px-4 py-4 text-sm leading-6 text-orange-50/85">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" />
            <p>
              Helpful pattern: use `content` for the short, high-signal message and keep the deeper context inside embeds.
              That keeps notifications readable without losing detail in the preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
