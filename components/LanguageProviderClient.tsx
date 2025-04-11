'use client';

import React, { ReactNode } from 'react';
import { LanguageProvider } from '../utils/LanguageContext';

interface LanguageProviderClientProps {
  children: ReactNode;
}

export default function LanguageProviderClient({ children }: LanguageProviderClientProps) {
  return <LanguageProvider>{children}</LanguageProvider>;
} 