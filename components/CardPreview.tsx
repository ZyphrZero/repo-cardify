'use client';

import React, { forwardRef } from 'react';
import { CardConfig, RepoData } from '../types';
import { useI18n } from './I18nContext';
import { CardSvg } from './CardSvg';

interface CardPreviewProps {
  data: RepoData;
  config: CardConfig;
}

export const CardPreview = forwardRef<SVGSVGElement, CardPreviewProps>(({ data, config }, ref) => {
  const { messages } = useI18n();

  return (
    <CardSvg
      ref={ref}
      data={data}
      config={config}
      labels={messages.card}
      noDescriptionText={messages.app.noDescription}
    />
  );
});

CardPreview.displayName = 'CardPreview';
