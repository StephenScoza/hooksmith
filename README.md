# Hooksmith

Hooksmith is a polished, client-side Discord webhook and embed visual generator built with React, TypeScript, Vite, TailwindCSS, Zustand, and Zod.

It is designed for developers, operators, community managers, and anyone who needs to build Discord webhook payloads quickly without memorizing the full payload structure by hand.

## What it does

- Visual builder for Discord webhook payloads
- Full support for `content`, `username`, `avatar_url`, `tts`, and `embeds`
- Embed support for `title`, `description`, `url`, `timestamp`, `color`, `author`, `footer`, `image`, `thumbnail`, and `fields`
- Live Discord-style preview
- Raw JSON editor with validation-aware syncing
- Export tabs for JSON, cURL, JavaScript fetch, Node.js, Python requests, Go, PHP, C#, and Java
- Copy-to-clipboard support for every export view
- Test-send panel for sending the current payload directly to a Discord webhook
- Local-only persistence with `localStorage`
- Sample templates for Announcement, Release Notes, Incident Alert, Welcome Message, and Moderation Log
- Responsive layout for desktop and mobile

## Safety notes

- Discord webhook URLs are secrets.
- Do not commit webhook URLs to source control.
- Do not paste real webhook URLs into screenshots, docs, issue trackers, or chat threads.
- Hooksmith keeps the webhook URL client-side only and does not persist it to `localStorage`.
- If a webhook URL is exposed, rotate it in Discord immediately.

## Validation coverage

Hooksmith enforces and surfaces the following Discord embed constraints without blocking editing:

- Max 10 embeds
- Max 25 fields per embed
- Title max 256 characters
- Description max 4096 characters
- Field name max 256 characters
- Field value max 1024 characters
- Footer text max 2048 characters
- Author name max 256 characters
- Total embed text max 6000 characters

## Project structure

```text
src/
  components/
    builder/
    export/
    preview/
    send/
    ui/
    validation/
  lib/
    discord.ts
    templates.ts
    validation.ts
    exporters/
  store/
```

## Local development

Recommended runtime: Node.js `20.19.0` or newer.

1. Install dependencies:

```bash
npm install
```

2. Start the Vite dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Implementation notes

- State is managed with Zustand and persisted locally with the `persist` middleware.
- Payload validation is handled with Zod plus custom Discord-specific checks like total embed text length.
- The export layer is centralized in `src/lib/exporters/index.ts` so new output formats are easy to add.
- The app is frontend-only and does not require authentication or a backend service.

## Recommended usage flow

1. Start with a template or the default payload.
2. Refine the message visually in the builder.
3. Review warnings in the validation panel.
4. Check the Discord-style preview.
5. Copy an export snippet or test-send using a webhook URL you trust.
