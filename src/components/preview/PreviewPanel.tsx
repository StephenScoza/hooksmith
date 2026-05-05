import { Bot, ImageIcon } from 'lucide-react';
import { calculateEmbedTextLength, decimalToHex } from '../../lib/discord';
import { useWebhookStore } from '../../store/useWebhookStore';
import { EmptyState, Panel, PanelHeader, SmallBadge } from '../ui/FormControls';

function formatTimestamp(timestamp?: string) {
  if (!timestamp) {
    return 'Today at 12:00 PM';
  }

  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return 'Invalid timestamp';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
}

export function PreviewPanel() {
  const payload = useWebhookStore((state) => state.payload);
  const previewName = payload.username?.trim() || 'Hooksmith';
  const avatarUrl = payload.avatar_url?.trim();

  return (
    <Panel>
      <PanelHeader
        eyebrow="Preview"
        title="Live Discord-style rendering"
        description="This is a close visual approximation of how Discord webhook content and embeds will appear."
        action={<SmallBadge tone="success">Live sync</SmallBadge>}
      />

      <div className="p-5 sm:p-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#313338] p-4 shadow-inner shadow-black/20 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-slate-700 text-sm font-semibold text-white">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <Bot className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-white">{previewName}</span>
                <span className="rounded bg-[#5865f2] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Bot
                </span>
                <span className="text-xs text-slate-400">{formatTimestamp()}</span>
              </div>

              {payload.content?.trim() ? (
                <p className="mb-3 whitespace-pre-wrap text-sm leading-6 text-[#dbdee1]">{payload.content}</p>
              ) : null}

              {payload.embeds.length === 0 && !payload.content?.trim() ? (
                <EmptyState
                  title="Preview is empty"
                  description="Add message content or populate an embed to see a realistic Discord-style result here."
                />
              ) : null}

              <div className="space-y-3">
                {payload.embeds.map((embed, embedIndex) => (
                  <div
                    key={embedIndex}
                    className="overflow-hidden rounded bg-[#2b2d31]"
                    style={{ borderLeft: `4px solid ${decimalToHex(embed.color)}` }}
                  >
                    <div className="flex gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        {embed.author?.name?.trim() ? (
                          <div className="mb-2 flex items-center gap-2">
                            {embed.author.icon_url?.trim() ? (
                              <img src={embed.author.icon_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : null}
                            <span className="text-xs font-semibold text-white">{embed.author.name}</span>
                          </div>
                        ) : null}

                        {embed.title?.trim() ? (
                          <h3 className="mb-2 text-[15px] font-semibold text-white">
                            {embed.url?.trim() ? (
                              <a href={embed.url} target="_blank" rel="noreferrer" className="hover:underline">
                                {embed.title}
                              </a>
                            ) : (
                              embed.title
                            )}
                          </h3>
                        ) : null}

                        {embed.description?.trim() ? (
                          <p className="whitespace-pre-wrap text-sm leading-6 text-[#dbdee1]">{embed.description}</p>
                        ) : null}

                        {embed.fields.length ? (
                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                            {embed.fields.map((field, fieldIndex) => (
                              <div key={fieldIndex} className={field.inline ? 'md:col-span-1' : 'md:col-span-3'}>
                                <p className="text-xs font-semibold text-white">{field.name || '\u200b'}</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#dbdee1]">{field.value || '\u200b'}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {embed.image?.url?.trim() ? (
                          <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black/10">
                            <img src={embed.image.url} alt="" className="max-h-[280px] w-full object-cover" />
                          </div>
                        ) : null}

                        {(embed.footer?.text?.trim() || embed.timestamp?.trim()) ? (
                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            {embed.footer?.icon_url?.trim() ? (
                              <img src={embed.footer.icon_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                            ) : null}
                            {embed.footer?.text?.trim() ? <span>{embed.footer.text}</span> : null}
                            {embed.footer?.text?.trim() && embed.timestamp?.trim() ? <span>&bull;</span> : null}
                            {embed.timestamp?.trim() ? <span>{formatTimestamp(embed.timestamp)}</span> : null}
                          </div>
                        ) : null}
                      </div>

                      {embed.thumbnail?.url?.trim() ? (
                        <img src={embed.thumbnail.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      ) : (
                        <div className="hidden rounded-lg border border-dashed border-white/10 p-4 text-slate-500 xl:block">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/5 bg-black/10 px-4 py-2 text-xs text-slate-500">
                      Embed text usage: {calculateEmbedTextLength(embed)}/6000 characters
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
