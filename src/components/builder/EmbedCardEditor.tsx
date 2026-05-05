import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Clock3, CopyPlus, Link2, Plus, Trash2 } from 'lucide-react';
import { DISCORD_LIMITS, calculateEmbedTextLength, decimalToHex, getCharacterLimitMessage, hexToDecimal, type DiscordEmbed } from '../../lib/discord';
import { cn } from '../../lib/utils';
import { useWebhookStore } from '../../store/useWebhookStore';
import { Button, EmptyState, SmallBadge, TextInput, TextareaInput, ToggleInput } from '../ui/FormControls';

type SectionKey = 'content' | 'meta' | 'identity' | 'media' | 'fields';

function CollapsibleSection({
  title,
  description,
  sectionKey,
  expandedSections,
  toggleSection,
  summary,
  children
}: {
  title: string;
  description: string;
  sectionKey: SectionKey;
  expandedSections: Record<SectionKey, boolean>;
  toggleSection: (section: SectionKey) => void;
  summary?: string;
  children: React.ReactNode;
}) {
  const expanded = expandedSections[sectionKey];

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/50">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4 text-orange-300" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
            <p className="text-sm font-medium text-white">{title}</p>
          </div>
          <p className="mt-1 pl-6 text-sm leading-6 text-slate-400">{summary ?? description}</p>
        </div>
      </button>

      {expanded ? <div className="border-t border-white/10 px-4 py-4 sm:px-5">{children}</div> : null}
    </section>
  );
}

export function EmbedCardEditor({ embed, embedIndex }: { embed: DiscordEmbed; embedIndex: number }) {
  const updateEmbed = useWebhookStore((state) => state.updateEmbed);
  const updateEmbedNested = useWebhookStore((state) => state.updateEmbedNested);
  const addField = useWebhookStore((state) => state.addField);
  const duplicateField = useWebhookStore((state) => state.duplicateField);
  const updateField = useWebhookStore((state) => state.updateField);
  const removeField = useWebhookStore((state) => state.removeField);
  const moveField = useWebhookStore((state) => state.moveField);
  const duplicateEmbed = useWebhookStore((state) => state.duplicateEmbed);
  const removeEmbed = useWebhookStore((state) => state.removeEmbed);
  const moveEmbed = useWebhookStore((state) => state.moveEmbed);
  const embedCount = useWebhookStore((state) => state.payload.embeds.length);

  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    content: true,
    meta: false,
    identity: false,
    media: false,
    fields: true
  });
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>({});

  function toggleSection(section: SectionKey) {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }

  function toggleField(fieldIndex: number) {
    setExpandedFields((current) => ({
      ...current,
      [fieldIndex]: !current[fieldIndex]
    }));
  }

  const titleSummary = embed.title?.trim() || 'Untitled embed';
  const embedTextUsage = calculateEmbedTextLength(embed);
  const mediaCount = [embed.image?.url?.trim(), embed.thumbnail?.url?.trim()].filter(Boolean).length;
  const linkCount = [embed.url?.trim(), embed.author?.url?.trim()].filter(Boolean).length;
  const contentSummary = useMemo(() => {
    const pieces = [titleSummary];
    if (embed.description?.trim()) {
      pieces.push(`${embed.description.trim().length} desc chars`);
    }
    pieces.push(`${embedTextUsage}/6000 text`);
    return pieces.join(' • ');
  }, [titleSummary, embed.description, embedTextUsage]);

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">Embed {embedIndex + 1}</p>
            <SmallBadge>{embed.fields.length}/{DISCORD_LIMITS.fields} fields</SmallBadge>
            {mediaCount ? <SmallBadge>{mediaCount} media</SmallBadge> : null}
            {embed.timestamp?.trim() ? <SmallBadge>timestamped</SmallBadge> : null}
          </div>
          <p className="mt-2 truncate text-sm text-slate-300">{contentSummary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" aria-label={`Move embed ${embedIndex + 1} up`} onClick={() => moveEmbed(embedIndex, -1)} disabled={embedIndex === 0}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" aria-label={`Move embed ${embedIndex + 1} down`} onClick={() => moveEmbed(embedIndex, 1)} disabled={embedIndex === embedCount - 1}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => duplicateEmbed(embedIndex)} disabled={embedCount >= DISCORD_LIMITS.embeds}>
            <CopyPlus className="h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="danger" onClick={() => removeEmbed(embedIndex)} disabled={embedCount === 1}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-5">
        <CollapsibleSection
          title="Content"
          description="Main title and description content for the embed card."
          sectionKey="content"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          summary={contentSummary}
        >
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <TextInput
                label="title"
                hint="Primary heading for the embed card."
                counter={`${embed.title?.length ?? 0}/${DISCORD_LIMITS.title}`}
                error={getCharacterLimitMessage(embed.title?.length ?? 0, DISCORD_LIMITS.title)}
                value={embed.title ?? ''}
                onChange={(event) => updateEmbed(embedIndex, { title: event.target.value })}
                placeholder="Webhook builder ready"
              />
              <TextInput
                label="url"
                hint="Optional URL linked from the embed title."
                value={embed.url ?? ''}
                onChange={(event) => updateEmbed(embedIndex, { url: event.target.value })}
                placeholder="https://example.com/details"
              />
            </div>

            <TextareaInput
              label="description"
              hint="Supports multi-line content and Markdown-like formatting in Discord."
              counter={`${embed.description?.length ?? 0}/${DISCORD_LIMITS.description}`}
              error={getCharacterLimitMessage(embed.description?.length ?? 0, DISCORD_LIMITS.description)}
              value={embed.description ?? ''}
              onChange={(event) => updateEmbed(embedIndex, { description: event.target.value })}
              placeholder="Describe the update, incident, release, or announcement here."
              className="min-h-[170px]"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Meta"
          description="Timestamp, link, and accent color controls."
          sectionKey="meta"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          summary={`${embed.timestamp?.trim() ? 'Timestamp set' : 'No timestamp'} • ${decimalToHex(embed.color)}`}
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <TextInput
                label="timestamp"
                hint="ISO 8601 date string such as 2026-05-05T13:00:00.000Z."
                value={embed.timestamp ?? ''}
                onChange={(event) => updateEmbed(embedIndex, { timestamp: event.target.value })}
                placeholder="2026-05-05T13:00:00.000Z"
              />
              <Button variant="secondary" onClick={() => updateEmbed(embedIndex, { timestamp: new Date().toISOString() })}>
                <Clock3 className="h-4 w-4" />
                Use current timestamp
              </Button>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <span className="text-sm font-medium text-slate-200">color</span>
              <input
                type="color"
                value={decimalToHex(embed.color)}
                onChange={(event) => updateEmbed(embedIndex, { color: hexToDecimal(event.target.value) })}
                className="h-12 w-full rounded-2xl border border-white/10 bg-transparent p-1"
              />
              <TextInput
                label="Hex"
                value={decimalToHex(embed.color)}
                onChange={(event) => updateEmbed(embedIndex, { color: hexToDecimal(event.target.value) })}
                className="font-mono"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Identity"
          description="Author and footer metadata for the embed."
          sectionKey="identity"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          summary={`${embed.author?.name?.trim() ? 'Author set' : 'No author'} • ${embed.footer?.text?.trim() ? 'Footer set' : 'No footer'}`}
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-medium text-white">author</p>
              <TextInput
                label="name"
                counter={`${embed.author?.name?.length ?? 0}/${DISCORD_LIMITS.authorName}`}
                error={getCharacterLimitMessage(embed.author?.name?.length ?? 0, DISCORD_LIMITS.authorName)}
                value={embed.author?.name ?? ''}
                onChange={(event) => updateEmbedNested(embedIndex, 'author', { name: event.target.value })}
                placeholder="Platform Ops"
              />
              <TextInput
                label="url"
                value={embed.author?.url ?? ''}
                onChange={(event) => updateEmbedNested(embedIndex, 'author', { url: event.target.value })}
                placeholder="https://example.com/team"
              />
              <TextInput
                label="icon_url"
                value={embed.author?.icon_url ?? ''}
                onChange={(event) => updateEmbedNested(embedIndex, 'author', { icon_url: event.target.value })}
                placeholder="https://images.example.com/author.png"
              />
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-medium text-white">footer</p>
              <TextInput
                label="text"
                counter={`${embed.footer?.text?.length ?? 0}/${DISCORD_LIMITS.footerText}`}
                error={getCharacterLimitMessage(embed.footer?.text?.length ?? 0, DISCORD_LIMITS.footerText)}
                value={embed.footer?.text ?? ''}
                onChange={(event) => updateEmbedNested(embedIndex, 'footer', { text: event.target.value })}
                placeholder="Notification feed"
              />
              <TextInput
                label="icon_url"
                value={embed.footer?.icon_url ?? ''}
                onChange={(event) => updateEmbedNested(embedIndex, 'footer', { icon_url: event.target.value })}
                placeholder="https://images.example.com/footer.png"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Media"
          description="Banner image and thumbnail URLs."
          sectionKey="media"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          summary={`${mediaCount} asset${mediaCount === 1 ? '' : 's'} • ${linkCount} linked surface${linkCount === 1 ? '' : 's'}`}
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <TextInput
              label="image url"
              hint="Large media rendered below the main embed body."
              value={embed.image?.url ?? ''}
              onChange={(event) => updateEmbedNested(embedIndex, 'image', { url: event.target.value })}
              placeholder="https://images.example.com/banner.png"
            />
            <TextInput
              label="thumbnail url"
              hint="Smaller image rendered on the right side of the embed."
              value={embed.thumbnail?.url ?? ''}
              onChange={(event) => updateEmbedNested(embedIndex, 'thumbnail', { url: event.target.value })}
              placeholder="https://images.example.com/thumb.png"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Fields"
          description="Structured key-value content blocks."
          sectionKey="fields"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          summary={`${embed.fields.length}/${DISCORD_LIMITS.fields} fields • ${embed.fields.filter((field) => field.inline).length} inline`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">fields</p>
                <p className="mt-1 text-sm text-slate-400">Add structured key/value blocks and reorder them as needed.</p>
              </div>
              <Button onClick={() => addField(embedIndex)} disabled={embed.fields.length >= DISCORD_LIMITS.fields}>
                <Plus className="h-4 w-4" />
                Add field
              </Button>
            </div>

            {embed.fields.length === 0 ? (
              <EmptyState
                title="No fields yet"
                description="Fields work well for changelog bullets, metadata, links, ownership details, and operational context."
              />
            ) : (
              <div className="space-y-3">
                {embed.fields.map((field, fieldIndex) => {
                  const expanded = expandedFields[fieldIndex] ?? fieldIndex === 0;
                  const fieldSummary = `${field.name.trim() || 'Untitled field'} • ${field.value.length}/${DISCORD_LIMITS.fieldValue}${field.inline ? ' • inline' : ''}`;

                  return (
                    <div key={fieldIndex} className="rounded-3xl border border-white/10 bg-slate-900/70">
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                        <button type="button" onClick={() => toggleField(fieldIndex)} className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            {expanded ? <ChevronDown className="h-4 w-4 text-orange-300" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                            <p className="text-sm font-medium text-white">Field {fieldIndex + 1}</p>
                          </div>
                          <p className="mt-1 pl-6 text-sm text-slate-400">{fieldSummary}</p>
                        </button>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" aria-label={`Move field ${fieldIndex + 1} up`} onClick={() => moveField(embedIndex, fieldIndex, -1)} disabled={fieldIndex === 0}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            aria-label={`Move field ${fieldIndex + 1} down`}
                            onClick={() => moveField(embedIndex, fieldIndex, 1)}
                            disabled={fieldIndex === embed.fields.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => duplicateField(embedIndex, fieldIndex)}
                            disabled={embed.fields.length >= DISCORD_LIMITS.fields}
                          >
                            <CopyPlus className="h-4 w-4" />
                          </Button>
                          <Button variant="danger" onClick={() => removeField(embedIndex, fieldIndex)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {expanded ? (
                        <div className="border-t border-white/10 px-4 py-4">
                          <div className="grid gap-4">
                            <TextInput
                              label="name"
                              counter={`${field.name.length}/${DISCORD_LIMITS.fieldName}`}
                              error={getCharacterLimitMessage(field.name.length, DISCORD_LIMITS.fieldName)}
                              value={field.name}
                              onChange={(event) => updateField(embedIndex, fieldIndex, { name: event.target.value })}
                              placeholder="Status"
                            />
                            <TextareaInput
                              label="value"
                              counter={`${field.value.length}/${DISCORD_LIMITS.fieldValue}`}
                              error={getCharacterLimitMessage(field.value.length, DISCORD_LIMITS.fieldValue)}
                              value={field.value}
                              onChange={(event) => updateField(embedIndex, fieldIndex, { value: event.target.value })}
                              placeholder="Investigating"
                              className="min-h-[110px]"
                            />
                            <ToggleInput
                              label="inline"
                              hint="Inline fields render side-by-side when there is room."
                              checked={field.inline}
                              onChange={(checked) => updateField(embedIndex, fieldIndex, { inline: checked })}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleSection>
      </div>
    </article>
  );
}
