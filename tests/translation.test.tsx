import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeClient } from '../components/HomeClient';
import { LanguageProvider } from '../utils/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

// Mock the fetch function
global.fetch = jest.fn((url) => {
  if (url.includes('/en/common.json')) {
    return Promise.resolve({
      json: () => Promise.resolve({
        hero: {
          title: 'Excellence in Auto',
          titleHighlight: 'Restoration'
        },
        services: {
          ourServices: 'Our Services'
        }
      })
    });
  } else if (url.includes('/es/common.json')) {
    return Promise.resolve({
      json: () => Promise.resolve({
        hero: {
          title: 'Excelencia en',
          titleHighlight: 'Restauración Automotriz'
        },
        services: {
          ourServices: 'Nuestros Servicios'
        }
      })
    });
  }
  return Promise.reject(new Error('Not found'));
}) as jest.Mock;

describe('Translation System', () => {
  test('Initial language is set to English', async () => {
    render(
      <LanguageProvider>
        <HomeClient />
      </LanguageProvider>
    );
    
    // Wait for translation to load
    await screen.findByText('Excellence in Auto', { exact: false });
    
    expect(screen.getByText('Excellence in Auto', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Our Services', { exact: false })).toBeInTheDocument();
  });
  
  test('Language toggle changes language from English to Spanish', async () => {
    render(
      <LanguageProvider>
        <>
          <LanguageToggle />
          <HomeClient />
        </>
      </LanguageProvider>
    );
    
    // Wait for English translations to load
    await screen.findByText('Excellence in Auto', { exact: false });
    
    // Click the Spanish language button
    fireEvent.click(screen.getByText('ES'));
    
    // Wait for Spanish translations to load
    await screen.findByText('Excelencia en', { exact: false });
    
    expect(screen.getByText('Excelencia en', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Nuestros Servicios', { exact: false })).toBeInTheDocument();
  });
  
  test('Language toggle changes language from Spanish to English', async () => {
    // Start with Spanish as the default
    localStorage.setItem('language', 'es');
    
    render(
      <LanguageProvider>
        <>
          <LanguageToggle />
          <HomeClient />
        </>
      </LanguageProvider>
    );
    
    // Wait for Spanish translations to load
    await screen.findByText('Excelencia en', { exact: false });
    
    // Click the English language button
    fireEvent.click(screen.getByText('EN'));
    
    // Wait for English translations to load
    await screen.findByText('Excellence in Auto', { exact: false });
    
    expect(screen.getByText('Excellence in Auto', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Our Services', { exact: false })).toBeInTheDocument();
    
    // Clean up
    localStorage.removeItem('language');
  });
}); 