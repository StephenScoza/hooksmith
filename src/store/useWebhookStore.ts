import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDefaultPayload, createEmptyEmbed, createEmptyField, serializePayload, type DiscordWebhookPayload } from '../lib/discord';
import { payloadTemplates } from '../lib/templates';
import { webhookPayloadSchema } from '../lib/validation';
import { moveItem } from '../lib/utils';

type BuilderTab = 'visual' | 'json';

type SendState = {
  status: 'idle' | 'sending' | 'success' | 'error';
  message?: string;
};

type WebhookStore = {
  payload: DiscordWebhookPayload;
  builderTab: BuilderTab;
  jsonDraft: string;
  jsonError: string | null;
  webhookUrl: string;
  sendState: SendState;
  setBuilderTab: (tab: BuilderTab) => void;
  updateRoot: <K extends keyof DiscordWebhookPayload>(key: K, value: DiscordWebhookPayload[K]) => void;
  replacePayload: (payload: DiscordWebhookPayload) => void;
  applyTemplate: (templateId: string) => void;
  resetPayload: () => void;
  addEmbed: () => void;
  removeEmbed: (embedIndex: number) => void;
  moveEmbed: (embedIndex: number, direction: -1 | 1) => void;
  updateEmbed: (embedIndex: number, patch: Partial<DiscordWebhookPayload['embeds'][number]>) => void;
  updateEmbedNested: (
    embedIndex: number,
    key: 'author' | 'footer' | 'image' | 'thumbnail',
    patch: Record<string, string>
  ) => void;
  addField: (embedIndex: number) => void;
  updateField: (embedIndex: number, fieldIndex: number, patch: Partial<DiscordWebhookPayload['embeds'][number]['fields'][number]>) => void;
  removeField: (embedIndex: number, fieldIndex: number) => void;
  moveField: (embedIndex: number, fieldIndex: number, direction: -1 | 1) => void;
  setJsonDraft: (value: string) => void;
  syncJsonDraftFromPayload: () => void;
  setWebhookUrl: (value: string) => void;
  setSendState: (state: SendState) => void;
};

function syncJson(payload: DiscordWebhookPayload) {
  return serializePayload(payload);
}

function setPayloadAndJson(payload: DiscordWebhookPayload) {
  return {
    payload,
    jsonDraft: syncJson(payload),
    jsonError: null
  };
}

export const useWebhookStore = create<WebhookStore>()(
  persist(
    (set) => ({
      ...setPayloadAndJson(createDefaultPayload()),
      builderTab: 'visual',
      webhookUrl: '',
      sendState: {
        status: 'idle'
      },
      setBuilderTab: (builderTab) => set({ builderTab }),
      updateRoot: (key, value) =>
        set((state) => {
          const payload = { ...state.payload, [key]: value };
          return setPayloadAndJson(payload);
        }),
      replacePayload: (payload) => set(setPayloadAndJson(payload)),
      applyTemplate: (templateId) =>
        set(() => {
          const template = payloadTemplates.find((entry) => entry.id === templateId);
          return setPayloadAndJson(template?.payload ?? createDefaultPayload());
        }),
      resetPayload: () => set(setPayloadAndJson(createDefaultPayload())),
      addEmbed: () =>
        set((state) => {
          const payload = {
            ...state.payload,
            embeds: [...state.payload.embeds, createEmptyEmbed()]
          };
          return setPayloadAndJson(payload);
        }),
      removeEmbed: (embedIndex) =>
        set((state) => {
          const nextEmbeds = state.payload.embeds.filter((_, index) => index !== embedIndex);
          const payload = {
            ...state.payload,
            embeds: nextEmbeds.length ? nextEmbeds : [createEmptyEmbed()]
          };
          return setPayloadAndJson(payload);
        }),
      moveEmbed: (embedIndex, direction) =>
        set((state) => {
          const payload = {
            ...state.payload,
            embeds: moveItem(state.payload.embeds, embedIndex, embedIndex + direction)
          };
          return setPayloadAndJson(payload);
        }),
      updateEmbed: (embedIndex, patch) =>
        set((state) => {
          const embeds = [...state.payload.embeds];
          embeds[embedIndex] = {
            ...embeds[embedIndex],
            ...patch
          };
          const payload = { ...state.payload, embeds };
          return setPayloadAndJson(payload);
        }),
      updateEmbedNested: (embedIndex, key, patch) =>
        set((state) => {
          const embeds = [...state.payload.embeds];
          const embed = embeds[embedIndex];
          embeds[embedIndex] = {
            ...embed,
            [key]: {
              ...(embed[key] ?? {}),
              ...patch
            }
          };
          const payload = { ...state.payload, embeds };
          return setPayloadAndJson(payload);
        }),
      addField: (embedIndex) =>
        set((state) => {
          const embeds = [...state.payload.embeds];
          const embed = embeds[embedIndex];
          embeds[embedIndex] = {
            ...embed,
            fields: [...embed.fields, createEmptyField()]
          };
          const payload = { ...state.payload, embeds };
          return setPayloadAndJson(payload);
        }),
      updateField: (embedIndex, fieldIndex, patch) =>
        set((state) => {
          const embeds = [...state.payload.embeds];
          const embed = embeds[embedIndex];
          const fields = [...embed.fields];
          fields[fieldIndex] = {
            ...fields[fieldIndex],
            ...patch
          };
          embeds[embedIndex] = {
            ...embed,
            fields
          };
          const payload = { ...state.payload, embeds };
          return setPayloadAndJson(payload);
        }),
      removeField: (embedIndex, fieldIndex) =>
        set((state) => {
          const embeds = [...state.payload.embeds];
          const embed = embeds[embedIndex];
          embeds[embedIndex] = {
            ...embed,
            fields: embed.fields.filter((_, index) => index !== fieldIndex)
          };
          const payload = { ...state.payload, embeds };
          return setPayloadAndJson(payload);
        }),
      moveField: (embedIndex, fieldIndex, direction) =>
        set((state) => {
          const embeds = [...state.payload.embeds];
          const embed = embeds[embedIndex];
          embeds[embedIndex] = {
            ...embed,
            fields: moveItem(embed.fields, fieldIndex, fieldIndex + direction)
          };
          const payload = { ...state.payload, embeds };
          return setPayloadAndJson(payload);
        }),
      setJsonDraft: (value) =>
        set((state) => {
          let parsed: unknown;

          try {
            parsed = JSON.parse(value) as unknown;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON syntax.';
            return {
              jsonDraft: value,
              jsonError: message
            };
          }

          const result = webhookPayloadSchema.safeParse(parsed);

          if (!result.success) {
            return {
              jsonDraft: value,
              jsonError: result.error.issues[0]?.message ?? 'JSON payload is invalid.'
            };
          }

          return {
            payload: result.data,
            jsonDraft: value,
            jsonError: null
          };
        }),
      syncJsonDraftFromPayload: () =>
        set((state) => ({
          jsonDraft: syncJson(state.payload),
          jsonError: null
        })),
      setWebhookUrl: (webhookUrl) => set({ webhookUrl }),
      setSendState: (sendState) => set({ sendState })
    }),
    {
      name: 'hooksmith-local-state',
      partialize: (state) => ({
        payload: state.payload,
        builderTab: state.builderTab,
        jsonDraft: state.jsonDraft
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.jsonDraft = syncJson(state.payload);
        state.jsonError = null;
        state.webhookUrl = '';
        state.sendState = { status: 'idle' };
      }
    }
  )
);
