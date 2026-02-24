'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Locale, LocaleMessages, getLocaleMessages } from '../i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  messages: LocaleMessages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ locale, setLocale, children }) => {
  const messages = useMemo(() => getLocaleMessages(locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, messages }), [locale, setLocale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
