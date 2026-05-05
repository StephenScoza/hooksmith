export const DISCORD_LIMITS = {
  content: 2000,
  username: 80,
  embeds: 10,
  title: 256,
  description: 4096,
  fields: 25,
  fieldName: 256,
  fieldValue: 1024,
  footerText: 2048,
  authorName: 256,
  embedTextTotal: 6000
} as const;

export const DEFAULT_EMBED_COLOR = 0x3b82f6;

export type DiscordEmbedField = {
  name: string;
  value: string;
  inline: boolean;
};

export type DiscordEmbedAuthor = {
  name?: string;
  url?: string;
  icon_url?: string;
};

export type DiscordEmbedFooter = {
  text?: string;
  icon_url?: string;
};

export type DiscordEmbedMedia = {
  url?: string;
};

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  author?: DiscordEmbedAuthor;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedMedia;
  thumbnail?: DiscordEmbedMedia;
  fields: DiscordEmbedField[];
};

export type DiscordWebhookPayload = {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds: DiscordEmbed[];
};

export function createEmptyField(): DiscordEmbedField {
  return {
    name: '',
    value: '',
    inline: false
  };
}

export function createEmptyEmbed(): DiscordEmbed {
  return {
    title: '',
    description: '',
    url: '',
    timestamp: '',
    color: DEFAULT_EMBED_COLOR,
    author: {
      name: '',
      url: '',
      icon_url: ''
    },
    footer: {
      text: '',
      icon_url: ''
    },
    image: {
      url: ''
    },
    thumbnail: {
      url: ''
    },
    fields: []
  };
}

export function createDefaultPayload(): DiscordWebhookPayload {
  return {
    content: 'Ship Discord updates with a polished webhook payload.',
    username: 'Hooksmith',
    avatar_url: '',
    tts: false,
    embeds: [
      {
        ...createEmptyEmbed(),
        title: 'Webhook builder ready',
        description:
          'Use the visual controls, JSON editor, and export tabs to generate safe, validated Discord webhook payloads.',
        color: DEFAULT_EMBED_COLOR,
        fields: [
          {
            name: 'Preview',
            value: 'See changes reflected in the Discord-style renderer immediately.',
            inline: true
          },
          {
            name: 'Export',
            value: 'Copy implementation-ready snippets for your language or tooling.',
            inline: true
          }
        ],
        footer: {
          text: 'Built with Hooksmith'
        }
      }
    ]
  };
}

function trimOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function sanitizeField(field: DiscordEmbedField): DiscordEmbedField | undefined {
  const name = field.name.trim();
  const value = field.value.trim();

  if (!name && !value) {
    return undefined;
  }

  return {
    name,
    value,
    inline: Boolean(field.inline)
  };
}

function sanitizeEmbed(embed: DiscordEmbed): DiscordEmbed {
  const fields = embed.fields.map(sanitizeField).filter((field): field is DiscordEmbedField => Boolean(field));
  const authorName = trimOptionalString(embed.author?.name);
  const authorUrl = trimOptionalString(embed.author?.url);
  const authorIcon = trimOptionalString(embed.author?.icon_url);
  const footerText = trimOptionalString(embed.footer?.text);
  const footerIcon = trimOptionalString(embed.footer?.icon_url);
  const imageUrl = trimOptionalString(embed.image?.url);
  const thumbnailUrl = trimOptionalString(embed.thumbnail?.url);

  return {
    fields,
    ...(trimOptionalString(embed.title) ? { title: embed.title?.trim() } : {}),
    ...(trimOptionalString(embed.description) ? { description: embed.description?.trim() } : {}),
    ...(trimOptionalString(embed.url) ? { url: embed.url?.trim() } : {}),
    ...(trimOptionalString(embed.timestamp) ? { timestamp: embed.timestamp?.trim() } : {}),
    ...(typeof embed.color === 'number' ? { color: embed.color } : {}),
    ...(authorName || authorUrl || authorIcon
      ? {
          author: {
            ...(authorName ? { name: authorName } : {}),
            ...(authorUrl ? { url: authorUrl } : {}),
            ...(authorIcon ? { icon_url: authorIcon } : {})
          }
        }
      : {}),
    ...(footerText || footerIcon
      ? {
          footer: {
            ...(footerText ? { text: footerText } : {}),
            ...(footerIcon ? { icon_url: footerIcon } : {})
          }
        }
      : {}),
    ...(imageUrl ? { image: { url: imageUrl } } : {}),
    ...(thumbnailUrl ? { thumbnail: { url: thumbnailUrl } } : {})
  };
}

export function sanitizePayload(payload: DiscordWebhookPayload): DiscordWebhookPayload {
  return {
    ...(trimOptionalString(payload.content) ? { content: payload.content?.trim() } : {}),
    ...(trimOptionalString(payload.username) ? { username: payload.username?.trim() } : {}),
    ...(trimOptionalString(payload.avatar_url) ? { avatar_url: payload.avatar_url?.trim() } : {}),
    ...(payload.tts ? { tts: true } : {}),
    embeds: payload.embeds.map(sanitizeEmbed)
  };
}

export function serializePayload(payload: DiscordWebhookPayload) {
  return JSON.stringify(sanitizePayload(payload), null, 2);
}

export function decimalToHex(value?: number) {
  return `#${(value ?? DEFAULT_EMBED_COLOR).toString(16).padStart(6, '0')}`;
}

export function hexToDecimal(value: string) {
  return Number.parseInt(value.replace('#', ''), 16);
}

export function calculateEmbedTextLength(embed: DiscordEmbed) {
  const parts = [
    embed.title,
    embed.description,
    embed.footer?.text,
    embed.author?.name,
    ...embed.fields.flatMap((field) => [field.name, field.value])
  ];

  return parts.reduce((total, part) => total + (part?.length ?? 0), 0);
}

export function hasAnyRenderableContent(payload: DiscordWebhookPayload) {
  if (payload.content?.trim()) {
    return true;
  }

  return payload.embeds.some((embed) => {
    return Boolean(
      embed.title?.trim() ||
        embed.description?.trim() ||
        embed.author?.name?.trim() ||
        embed.footer?.text?.trim() ||
        embed.image?.url?.trim() ||
        embed.thumbnail?.url?.trim() ||
        embed.fields.some((field) => field.name.trim() || field.value.trim())
    );
  });
}
