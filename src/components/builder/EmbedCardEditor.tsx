import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Clock3, CopyPlus, Plus, Sparkles, Trash2 } from 'lucide-react';
import {
  DISCORD_LIMITS,
  calculateEmbedTextLength,
  createEmptyEmbed,
  decimalToHex,
  getCharacterLimitMessage,
  hexToDecimal,
  type DiscordEmbed,
  type DiscordEmbedField
} from '../../lib/discord';
import { useWebhookStore } from '../../store/useWebhookStore';
import { Button, EmptyState, SmallBadge, TextInput, TextareaInput, ToggleInput } from '../ui/FormControls';

type SectionKey = 'content' | 'meta' | 'identity' | 'media' | 'fields';

type EmbedPreset = {
  id: string;
  name: string;
  description: string;
  build: () => DiscordEmbed;
};

type FieldPreset = {
  id: string;
  name: string;
  description: string;
  fields: DiscordEmbedField[];
};

const embedPresets: EmbedPreset[] = [
  {
    id: 'status-update',
    name: 'Status update',
    description: 'Quick progress card for launches, rollouts, or milestone updates.',
    build: () => ({
      ...createEmptyEmbed(),
      title: 'Rollout status: 78% complete',
      description: 'The release is progressing normally. Regional checks are green and final validation is underway.',
      color: 0xf97316,
      fields: [
        {
          name: 'Current phase',
          value: 'Gradual rollout',
          inline: true
        },
        {
          name: 'Owner',
          value: 'Release engineering',
          inline: true
        },
        {
          name: 'Next checkpoint',
          value: 'Confirm error rate remains below threshold for 30 more minutes.',
          inline: false
        }
      ],
      footer: {
        text: 'Status communications'
      }
    })
  },
  {
    id: 'release-card',
    name: 'Release card',
    description: 'Structured release summary with highlights and next steps.',
    build: () => ({
      ...createEmptyEmbed(),
      title: 'Hooksmith v1.3.0',
      description: 'A cleaner builder flow, stronger validation, and safer webhook testing tools are now available.',
      url: 'https://example.com/changelog',
      color: 0x2563eb,
      fields: [
        {
          name: 'Highlights',
          value: 'Preset embeds, tighter mobile UX, and expanded export workflows.',
          inline: false
        },
        {
          name: 'Migration',
          value: 'No breaking changes',
          inline: true
        },
        {
          name: 'Docs',
          value: 'Review the changelog for setup notes.',
          inline: true
        }
      ],
      footer: {
        text: 'Release stream'
      }
    })
  },
  {
    id: 'incident-alert',
    name: 'Incident alert',
    description: 'High-signal operational incident format with timestamp and ownership.',
    build: () => ({
      ...createEmptyEmbed(),
      title: 'SEV-2 incident: elevated webhook failures',
      description: 'We are investigating increased delivery failures affecting a subset of outbound Discord notifications.',
      color: 0xef4444,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Impact',
          value: 'Roughly 18% of sends are retrying and some notifications may arrive late.',
          inline: false
        },
        {
          name: 'Status',
          value: 'Investigating',
          inline: true
        },
        {
          name: 'Owner',
          value: 'On-call platform team',
          inline: true
        }
      ],
      footer: {
        text: 'Incident communications'
      }
    })
  },
  {
    id: 'welcome-block',
    name: 'Welcome block',
    description: 'Friendly onboarding card for communities and customer spaces.',
    build: () => ({
      ...createEmptyEmbed(),
      title: 'Welcome aboard',
      description: 'Here are the first places to visit so you can get oriented quickly and find the right conversations.',
      color: 0xf59e0b,
      fields: [
        {
          name: 'Start here',
          value: 'Read the rules, introduce yourself, and check the announcement channels.',
          inline: false
        },
        {
          name: 'Need help?',
          value: 'Ping a moderator or open a support thread.',
          inline: false
        }
      ],
      footer: {
        text: 'Welcome flow'
      }
    })
  },
  {
    id: 'link-roundup',
    name: 'Link roundup',
    description: 'Compact resource card for docs, demos, or campaign links.',
    build: () => ({
      ...createEmptyEmbed(),
      title: 'This week in resources',
      description: 'A compact roundup of docs, demos, and follow-up links for the team.',
      color: 0x14b8a6,
      fields: [
        {
          name: 'Docs',
          value: '[Implementation guide](https://example.com/docs)',
          inline: true
        },
        {
          name: 'Demo',
          value: '[Watch the walkthrough](https://example.com/demo)',
          inline: true
        },
        {
          name: 'Next read',
          value: '[Release notes and rollout checklist](https://example.com/release)',
          inline: false
        }
      ],
      footer: {
        text: 'Resource roundup'
      }
    })
  }
];

const fieldPresets: FieldPreset[] = [
  {
    id: 'ops-triad',
    name: 'Ops triad',
    description: 'Status, owner, and impact for incidents or launch monitoring.',
    fields: [
      { name: 'Status', value: 'Investigating', inline: true },
      { name: 'Owner', value: 'On-call team', inline: true },
      { name: 'Impact', value: 'Describe user-facing impact here.', inline: false }
    ]
  },
  {
    id: 'release-triad',
    name: 'Release triad',
    description: 'Version, environment, and docs links for shipping notes.',
    fields: [
      { name: 'Version', value: 'v1.0.0', inline: true },
      { name: 'Environment', value: 'Production', inline: true },
      { name: 'Docs', value: 'Link changelog, migration steps, or follow-up notes.', inline: false }
    ]
  },
  {
    id: 'moderation-triad',
    name: 'Moderation triad',
    description: 'Subject, action, and reason for audit-style records.',
    fields: [
      { name: 'Member', value: '@example-user', inline: true },
      { name: 'Action', value: 'Timeout - 24 hours', inline: true },
      { name: 'Reason', value: 'Summarize the rule violation or decision context.', inline: false }
    ]
  }
];

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

  function applyEmbedPreset(preset: EmbedPreset) {
    updateEmbed(embedIndex, preset.build());
    setExpandedSections({
      content: true,
      meta: true,
      identity: true,
      media: true,
      fields: true
    });
  }

  function applyFieldPreset(preset: FieldPreset) {
    const availableSlots = DISCORD_LIMITS.fields - embed.fields.length;

    if (availableSlots <= 0) {
      return;
    }

    updateEmbed(embedIndex, {
      fields: [...embed.fields, ...preset.fields.slice(0, availableSlots).map((field) => ({ ...field }))]
    });
    setExpandedSections((current) => ({
      ...current,
      fields: true
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
          <Button
            variant="ghost"
            aria-label={`Move embed ${embedIndex + 1} down`}
            onClick={() => moveEmbed(embedIndex, 1)}
            disabled={embedIndex === embedCount - 1}
          >
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
            <div className="rounded-3xl border border-[color:rgba(249,115,22,0.22)] bg-[color:rgba(249,115,22,0.08)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-orange-300" />
                    <p className="text-sm font-medium text-white">Preset starters</p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Drop in a proven embed shape, then tailor the copy, links, and media for this message.
                  </p>
                </div>
                <SmallBadge>{embedPresets.length} presets</SmallBadge>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {embedPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyEmbedPreset(preset)}
                    className="rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-4 text-left transition hover:border-[color:rgba(249,115,22,0.4)] hover:bg-slate-950/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{preset.name}</p>
                      <SmallBadge>Apply</SmallBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

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

            <div className="grid gap-3 lg:grid-cols-3">
              {fieldPresets.map((preset) => {
                const remaining = DISCORD_LIMITS.fields - embed.fields.length;
                const addedCount = Math.min(remaining, preset.fields.length);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyFieldPreset(preset)}
                    disabled={remaining <= 0}
                    className="rounded-3xl border border-white/10 bg-slate-950/50 px-4 py-4 text-left transition hover:border-[color:rgba(249,115,22,0.4)] hover:bg-slate-950/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{preset.name}</p>
                      <SmallBadge>
                        {addedCount} field{addedCount === 1 ? '' : 's'}
                      </SmallBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{preset.description}</p>
                  </button>
                );
              })}
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
