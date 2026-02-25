import { Locale } from '../i18n';
import { CardConfig, createDefaultCardConfig } from '../types';
import { sanitizeCardConfig } from './presetService';

const SHARE_CONFIG_PARAM = 'c';
const SHARE_LOCALE_PARAM = 'l';
const SHARE_CONFIG_MAX_QUERY_LENGTH = 12000;
const SHARE_CONFIG_MAX_JSON_LENGTH = 12000;
const MAX_CUSTOM_LOGO_LENGTH = 2048;
const SHARE_CONFIG_PAYLOAD_VERSION = 3;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

interface ShareConfigPayloadV3 {
  v: typeof SHARE_CONFIG_PAYLOAD_VERSION;
  p: JsonValue | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const toBase64Url = (value: string) =>
  toBase64(textEncoder.encode(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = normalized.length % 4;
  const padded = paddingLength === 0 ? normalized : `${normalized}${'='.repeat(4 - paddingLength)}`;
  return textDecoder.decode(fromBase64(padded));
};

const sanitizeShareConfig = (config: CardConfig): CardConfig => {
  if (config.customLogo && config.customLogo.length > MAX_CUSTOM_LOGO_LENGTH) {
    return {
      ...config,
      customLogo: null,
    };
  }
  return config;
};

const deepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (!deepEqual(left[index], right[index])) return false;
    }
    return true;
  }

  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    for (const key of leftKeys) {
      if (!(key in right)) return false;
      if (!deepEqual(left[key], right[key])) return false;
    }
    return true;
  }

  return false;
};

const buildConfigPatch = (current: unknown, baseline: unknown): JsonValue | undefined => {
  if (deepEqual(current, baseline)) {
    return undefined;
  }

  if (Array.isArray(current)) {
    return current as JsonValue;
  }

  if (isRecord(current) && isRecord(baseline)) {
    const patch: Record<string, JsonValue> = {};
    for (const key of Object.keys(current)) {
      const childPatch = buildConfigPatch(current[key], baseline[key]);
      if (childPatch !== undefined) {
        patch[key] = childPatch;
      }
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  }

  return current as JsonValue;
};

const applyConfigPatch = (baseline: unknown, patch: unknown): unknown => {
  if (patch === undefined || patch === null) {
    return baseline;
  }

  if (Array.isArray(patch)) {
    return patch;
  }

  if (isRecord(patch) && isRecord(baseline)) {
    const merged: Record<string, unknown> = { ...baseline };
    for (const [key, value] of Object.entries(patch)) {
      merged[key] = applyConfigPatch(baseline[key], value);
    }
    return merged;
  }

  return patch;
};

const isShareConfigPayloadV3 = (value: unknown): value is ShareConfigPayloadV3 =>
  isRecord(value) &&
  value.v === SHARE_CONFIG_PAYLOAD_VERSION &&
  Object.prototype.hasOwnProperty.call(value, 'p');

export const encodeShareConfig = (config: CardConfig): string | null => {
  const safeConfig = sanitizeShareConfig(config);
  const defaults = createDefaultCardConfig();
  const patch = buildConfigPatch(safeConfig, defaults) ?? null;
  if (!patch) {
    return null;
  }

  const payload: ShareConfigPayloadV3 = {
    v: SHARE_CONFIG_PAYLOAD_VERSION,
    p: patch,
  };
  return toBase64Url(JSON.stringify(payload));
};

export const decodeShareConfig = (encodedConfig: string | null): CardConfig | null => {
  if (!encodedConfig || encodedConfig.length > SHARE_CONFIG_MAX_QUERY_LENGTH) {
    return null;
  }

  try {
    const decoded = fromBase64Url(encodedConfig);
    if (decoded.length > SHARE_CONFIG_MAX_JSON_LENGTH) {
      return null;
    }

    const raw = JSON.parse(decoded);
    if (!isShareConfigPayloadV3(raw)) {
      return null;
    }

    const defaults = createDefaultCardConfig();
    const merged = applyConfigPatch(defaults, raw.p ?? null);
    const config = sanitizeCardConfig(merged);
    if (!config) return null;
    return sanitizeShareConfig(config);
  } catch {
    return null;
  }
};

const encodePathSegment = (value: string) => encodeURIComponent(value.trim());

export const buildShareImagePath = (
  owner: string,
  name: string,
  config: CardConfig,
  locale: Locale
): string => {
  const params = new URLSearchParams();
  const encodedConfig = encodeShareConfig(config);
  if (encodedConfig) {
    params.set(SHARE_CONFIG_PARAM, encodedConfig);
  }
  if (locale !== 'en') {
    params.set(SHARE_LOCALE_PARAM, locale);
  }

  const query = params.toString();
  const path = `/${encodePathSegment(owner)}/${encodePathSegment(name)}/image`;
  return query ? `${path}?${query}` : path;
};
