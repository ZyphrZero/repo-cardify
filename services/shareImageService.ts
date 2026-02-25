import { Locale } from '../i18n';
import { CardConfig, createDefaultCardConfig } from '../types';
import { sanitizeCardConfig } from './presetService';

const SHARE_CONFIG_PARAM = 'c';
const SHARE_LOCALE_PARAM = 'l';
const SHARE_CONFIG_MAX_JSON_LENGTH = 12000;
const SHARE_CONFIG_PAYLOAD_VERSION = 1;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const toBase64 = (value: string): string => {
  const bytes = textEncoder.encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = normalized.length % 4;
  const padded = paddingLength === 0 ? normalized : `${normalized}${'='.repeat(4 - paddingLength)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return textDecoder.decode(bytes);
};

const deepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    return left.every((item, index) => deepEqual(item, right[index]));
  }

  if (left !== null && right !== null && typeof left === 'object' && typeof right === 'object') {
    const leftKeys = Object.keys(left as Record<string, unknown>);
    const rightKeys = Object.keys(right as Record<string, unknown>);
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every((key) => deepEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]));
  }

  return false;
};

const removeDefaults = (config: CardConfig): CardConfig => {
  const defaults = createDefaultCardConfig();

  const filtered: CardConfig = { ...config };

  if (config.theme === defaults.theme) delete filtered.theme;
  if (config.font === defaults.font) delete filtered.font;
  if (deepEqual(config.colors, defaults.colors)) delete filtered.colors;
  if (deepEqual(config.pattern, defaults.pattern)) delete filtered.pattern;
  if (deepEqual(config.badge, defaults.badge)) delete filtered.badge;
  if (deepEqual(config.avatar, defaults.avatar)) delete filtered.avatar;
  if (deepEqual(config.stats, defaults.stats)) delete filtered.stats;
  if (deepEqual(config.text, defaults.text)) delete filtered.text;
  if (deepEqual(config.layout, defaults.layout)) delete filtered.layout;
  if (config.customLogo === defaults.customLogo) delete filtered.customLogo;

  return filtered;
};

export const buildShareImagePath = (
  owner: string,
  name: string,
  config: CardConfig,
  locale: Locale
): string => {
  const minimized = removeDefaults(config);
  const json = JSON.stringify({ v: SHARE_CONFIG_PAYLOAD_VERSION, c: minimized });
  let configParam: string;
  if (json.length > SHARE_CONFIG_MAX_JSON_LENGTH) {
    console.warn('Share config exceeds recommended size, truncating customLogo');
    const truncated = { ...minimized, customLogo: null };
    const truncatedJson = JSON.stringify({ v: SHARE_CONFIG_PAYLOAD_VERSION, c: truncated });
    configParam = toBase64(truncatedJson);
  } else {
    configParam = toBase64(json);
  }

  const localeParam = locale === 'en' ? '' : `&${SHARE_LOCALE_PARAM}=${locale}`;

  return `/${owner}/${name}/image?${SHARE_CONFIG_PARAM}=${configParam}${localeParam}`;
};

export const decodeShareConfig = (param: string | null): CardConfig | null => {
  if (!param) return null;

  try {
    const json = fromBase64Url(param);
    const parsed: JsonValue = JSON.parse(json);

    if (!parsed || typeof parsed !== 'object') return null;
    const payload = parsed as { v?: JsonValue; c?: JsonValue };
    const version = payload.v;
    const configJson = payload.c;

    if (typeof version !== 'number' || typeof configJson !== 'object' || configJson === null) {
      return null;
    }

    const rawConfig = configJson as JsonValue;
    const sanitized = sanitizeCardConfig(rawConfig as Record<string, JsonValue>);
    return sanitized;
  } catch {
    return null;
  }
};
