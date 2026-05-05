import { z } from 'zod';
import {
  DISCORD_LIMITS,
  calculateEmbedTextLength,
  hasAnyRenderableContent,
  type DiscordWebhookPayload
} from './discord';

const optionalUrl = z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional();

const fieldSchema = z.object({
  name: z.string().max(DISCORD_LIMITS.fieldName, `Field name must be ${DISCORD_LIMITS.fieldName} characters or fewer.`),
  value: z
    .string()
    .max(DISCORD_LIMITS.fieldValue, `Field value must be ${DISCORD_LIMITS.fieldValue} characters or fewer.`),
  inline: z.boolean()
});

const embedSchema = z.object({
  title: z.string().max(DISCORD_LIMITS.title, `Title must be ${DISCORD_LIMITS.title} characters or fewer.`).optional(),
  description: z
    .string()
    .max(DISCORD_LIMITS.description, `Description must be ${DISCORD_LIMITS.description} characters or fewer.`)
    .optional(),
  url: optionalUrl,
  timestamp: z.string().optional(),
  color: z.number().int().min(0).max(0xffffff).optional(),
  author: z
    .object({
      name: z
        .string()
        .max(DISCORD_LIMITS.authorName, `Author name must be ${DISCORD_LIMITS.authorName} characters or fewer.`),
      url: optionalUrl,
      icon_url: optionalUrl
    })
    .optional(),
  footer: z
    .object({
      text: z
        .string()
        .max(DISCORD_LIMITS.footerText, `Footer text must be ${DISCORD_LIMITS.footerText} characters or fewer.`),
      icon_url: optionalUrl
    })
    .optional(),
  image: z.object({ url: optionalUrl }).optional(),
  thumbnail: z.object({ url: optionalUrl }).optional(),
  fields: z.array(fieldSchema).max(DISCORD_LIMITS.fields, `Each embed supports at most ${DISCORD_LIMITS.fields} fields.`)
});

export const webhookPayloadSchema = z.object({
  content: z.string().max(DISCORD_LIMITS.content, `Content must be ${DISCORD_LIMITS.content} characters or fewer.`).optional(),
  username: z.string().max(DISCORD_LIMITS.username, `Username must be ${DISCORD_LIMITS.username} characters or fewer.`).optional(),
  avatar_url: optionalUrl,
  tts: z.boolean().optional(),
  embeds: z.array(embedSchema).max(DISCORD_LIMITS.embeds, `A payload can include at most ${DISCORD_LIMITS.embeds} embeds.`)
});

export type ValidationIssue = {
  path: string;
  message: string;
};

function formatPath(path: PropertyKey[]) {
  if (!path.length) {
    return 'payload';
  }

  return path
    .map((segment) => {
      if (typeof segment === 'number') {
        return `[${segment + 1}]`;
      }

      if (typeof segment === 'symbol') {
        return String(segment);
      }

      return segment;
    })
    .join('.')
    .replace('.[', '[');
}

export function getValidationIssues(payload: DiscordWebhookPayload): ValidationIssue[] {
  const result = webhookPayloadSchema.safeParse(payload);
  const issues: ValidationIssue[] = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({
        path: formatPath(issue.path),
        message: issue.message
      });
    }
  }

  payload.embeds.forEach((embed, index) => {
    if (calculateEmbedTextLength(embed) > DISCORD_LIMITS.embedTextTotal) {
      issues.push({
        path: `embeds[${index + 1}]`,
        message: `Total embed text must be ${DISCORD_LIMITS.embedTextTotal} characters or fewer.`
      });
    }

    if (embed.timestamp && Number.isNaN(Date.parse(embed.timestamp))) {
      issues.push({
        path: `embeds[${index + 1}].timestamp`,
        message: 'Timestamp must be a valid ISO 8601 date string.'
      });
    }
  });

  if (!hasAnyRenderableContent(payload)) {
    issues.push({
      path: 'payload',
      message: 'Discord requires message content or at least one populated embed.'
    });
  }

  return issues;
}
