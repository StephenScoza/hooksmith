import { createEmptyEmbed, type DiscordWebhookPayload } from './discord';

export type PayloadTemplate = {
  id: string;
  name: string;
  description: string;
  payload: DiscordWebhookPayload;
};

export const payloadTemplates: PayloadTemplate[] = [
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Feature launches, launches, and community updates.',
    payload: {
      content: '@everyone A new update just landed.',
      username: 'Hooksmith',
      avatar_url: '',
      tts: false,
      embeds: [
        {
          ...createEmptyEmbed(),
          title: 'Now shipping: Hooksmith 1.0',
          description:
            'A cleaner builder, stronger validation, richer exports, and a safer workflow for testing webhook payloads.',
          url: 'https://example.com/changelog',
          color: 0x22c55e,
          fields: [
            {
              name: 'Highlights',
              value: 'Live preview, JSON editing, test sends, and reusable templates.',
              inline: false
            },
            {
              name: 'Docs',
              value: 'Read the release notes for setup guidance and safety notes.',
              inline: true
            },
            {
              name: 'Status',
              value: 'Rolling out now',
              inline: true
            }
          ],
          footer: {
            text: 'Announcement feed'
          }
        }
      ]
    }
  },
  {
    id: 'release-notes',
    name: 'Release Notes',
    description: 'Structured notes for product or version updates.',
    payload: {
      content: 'Release notes for v2.4.0',
      username: 'Release Bot',
      avatar_url: '',
      tts: false,
      embeds: [
        {
          ...createEmptyEmbed(),
          title: 'Version 2.4.0',
          description: 'This release focuses on delivery speed, clarity, and operational safety.',
          color: 0x3b82f6,
          fields: [
            {
              name: 'Added',
              value: 'Webhook template presets and multi-language export snippets.',
              inline: false
            },
            {
              name: 'Improved',
              value: 'Validation messaging and mobile responsiveness.',
              inline: false
            },
            {
              name: 'Fixed',
              value: 'Color handling, field ordering, and payload serialization.',
              inline: false
            }
          ],
          footer: {
            text: 'Release stream'
          }
        }
      ]
    }
  },
  {
    id: 'incident-alert',
    name: 'Incident Alert',
    description: 'On-call, uptime, and operational incident updates.',
    payload: {
      content: '<!here> Investigating elevated API errors.',
      username: 'Ops Watch',
      avatar_url: '',
      tts: false,
      embeds: [
        {
          ...createEmptyEmbed(),
          title: 'SEV-2 Incident',
          description: 'We are investigating increased webhook delivery failures in the us-east region.',
          color: 0xef4444,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: 'Impact',
              value: 'Webhook delivery latency is above normal and retries are increasing.',
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
        }
      ]
    }
  },
  {
    id: 'welcome-message',
    name: 'Welcome Message',
    description: 'Onboarding, rules, and getting-started flows.',
    payload: {
      content: 'Welcome to the server!',
      username: 'Community Guide',
      avatar_url: '',
      tts: false,
      embeds: [
        {
          ...createEmptyEmbed(),
          title: 'Glad you are here',
          description: 'Start with the essentials below so you can jump into the right channels quickly.',
          color: 0xf59e0b,
          fields: [
            {
              name: 'Read first',
              value: 'Check the server rules and introductions channel.',
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
        }
      ]
    }
  },
  {
    id: 'moderation-log',
    name: 'Moderation Log',
    description: 'Audit-style records for moderation actions.',
    payload: {
      content: '',
      username: 'Mod Log',
      avatar_url: '',
      tts: false,
      embeds: [
        {
          ...createEmptyEmbed(),
          title: 'Moderation Action Recorded',
          description: 'A timeout was applied to a member after repeated rule violations.',
          color: 0x8b5cf6,
          fields: [
            {
              name: 'Member',
              value: '@example-user',
              inline: true
            },
            {
              name: 'Action',
              value: 'Timeout - 24 hours',
              inline: true
            },
            {
              name: 'Reason',
              value: 'Repeated spam after prior warning.',
              inline: false
            }
          ],
          footer: {
            text: 'Moderation audit trail'
          }
        }
      ]
    }
  }
];
