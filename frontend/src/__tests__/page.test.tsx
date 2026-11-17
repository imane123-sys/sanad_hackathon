import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '../app/page';
import { LanguageProvider } from '../i18n/context';
import { AuthProvider } from '../context/auth-context';

describe('HomePage', () => {
  it('renders SANAD welcome branding, emergency hotline 1919, and quick exit', () => {
    render(
      <AuthProvider>
        <LanguageProvider>
          <HomePage />
        </LanguageProvider>
      </AuthProvider>,
    );

    expect(screen.getAllByText('سَنَد').length).toBeGreaterThan(0);
    expect(screen.getByText('1919')).toBeInTheDocument();
    expect(screen.getByText('خروج سريع')).toBeInTheDocument();
  });
});
