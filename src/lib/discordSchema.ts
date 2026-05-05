export type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
  };
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: DiscordEmbedField[];
};

export type WebhookPayload = {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
};

export const DEFAULT_EMBED: DiscordEmbed = {
  title: 'Welcome to Hooksmith',
  description: 'Forge Discord webhook embeds visually, then export clean code.',
  color: 0xf97316,
  fields: [
    {
      name: 'Design',
      value: 'Edit the form on the left.',
      inline: true
    },
    {
      name: 'Export',
      value: 'Copy JSON, cURL, JS, or Python.',
      inline: true
    }
  ],
  footer: {
    text: 'Hooksmith MVP'
  }
};
