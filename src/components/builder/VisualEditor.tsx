import { Plus, Sparkles } from 'lucide-react';
import { DISCORD_LIMITS, getCharacterLimitMessage } from '../../lib/discord';
import { useWebhookStore } from '../../store/useWebhookStore';
import { EmbedCardEditor } from './EmbedCardEditor';
import { Button, EmptyState, PanelHeader, SmallBadge, TextInput, TextareaInput, ToggleInput } from '../ui/FormControls';

export function VisualEditor() {
  const payload = useWebhookStore((state) => state.payload);
  const updateRoot = useWebhookStore((state) => state.updateRoot);
  const addEmbed = useWebhookStore((state) => state.addEmbed);

  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="space-y-6">
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

        <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-4 text-sm leading-6 text-cyan-50/85">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
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
