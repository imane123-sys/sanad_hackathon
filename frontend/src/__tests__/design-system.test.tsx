import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { LanguageProvider, useI18n } from '../i18n/context';
import { SanadLogo } from '../components/sanad-logo';
import { TrustPills } from '../components/trust-pills';
import { FeatureCard } from '../components/feature-card';
import { JourneySteps } from '../components/journey-steps';
import { SafetyBanner } from '../components/safety-banner';
import { LanguageSwitcher } from '../components/language-switcher';
import { Shield, Sparkles } from 'lucide-react';

describe('SANAD Design System Components', () => {
  describe('SanadLogo', () => {
    it('renders the SVG mark and brand name correctly', () => {
      render(
        <LanguageProvider>
          <SanadLogo size="md" orientation="horizontal" showText={true} />
        </LanguageProvider>,
      );

      expect(screen.getByText('سَنَد')).toBeInTheDocument();
      expect(screen.getByText('SANAD')).toBeInTheDocument();
    });

    it('renders in vertical orientation with custom className', () => {
      const { container } = render(
        <LanguageProvider>
          <SanadLogo size="lg" orientation="vertical" />
        </LanguageProvider>,
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByText('سَنَد')).toBeInTheDocument();
    });
  });

  describe('TrustPills', () => {
    it('renders the 3 trust pills in Arabic', () => {
      render(
        <LanguageProvider>
          <TrustPills />
        </LanguageProvider>,
      );

      expect(screen.getByText('للنساء فقط')).toBeInTheDocument();
      expect(screen.getByText('آمنة وسرية 100%')).toBeInTheDocument();
      expect(screen.getByText('سهلة ومجانية')).toBeInTheDocument();
    });
  });

  describe('FeatureCard', () => {
    it('renders title, description, icon, and tags', () => {
      render(
        <FeatureCard
          icon={<Shield className="h-6 w-6 text-[#7B2C98]" />}
          title="الحماية الرقمية"
          description="حماية فورية للأدلة الرقمية وتشفير كامل"
          badge="مضمون"
          tags={['تشفير عالي', 'سرية تامة']}
        />,
      );

      expect(screen.getByText('الحماية الرقمية')).toBeInTheDocument();
      expect(screen.getByText('حماية فورية للأدلة الرقمية وتشفير كامل')).toBeInTheDocument();
      expect(screen.getByText('مضمون')).toBeInTheDocument();
      expect(screen.getByText('تشفير عالي')).toBeInTheDocument();
      expect(screen.getByText('سرية تامة')).toBeInTheDocument();
    });
  });

  describe('JourneySteps', () => {
    it('renders 5 workflow steps matching hackathon_violence.jpg', () => {
      render(
        <LanguageProvider>
          <JourneySteps />
        </LanguageProvider>,
      );

      // Verify all 5 steps are present
      expect(screen.getByText('المرحلة 1')).toBeInTheDocument();
      expect(screen.getByText('المرحلة 2')).toBeInTheDocument();
      expect(screen.getByText('المرحلة 3')).toBeInTheDocument();
      expect(screen.getByText('المرحلة 4')).toBeInTheDocument();
      expect(screen.getByText('المرحلة 5')).toBeInTheDocument();

      // Check Arabic labels
      expect(screen.getByText('تبداي بأمان')).toBeInTheDocument();
      expect(screen.getByText('تعبئي المعلومات')).toBeInTheDocument();
      expect(screen.getByText('تجمعي الأدلة')).toBeInTheDocument();
      expect(screen.getByText('كيحلل الحالة (IA)')).toBeInTheDocument();
      expect(screen.getByText('كتوصلي بالمساعدة')).toBeInTheDocument();
    });
  });

  describe('SafetyBanner', () => {
    it('renders the confidentiality message and lock icon', () => {
      render(
        <LanguageProvider>
          <SafetyBanner />
        </LanguageProvider>,
      );

      expect(
        screen.getByText(/بياناتك سرية ومحمية بالكامل/i),
      ).toBeInTheDocument();
    });
  });

  describe('LanguageSwitcher', () => {
    function SwitcherWrapper() {
      const { locale } = useI18n();
      return (
        <div>
          <LanguageSwitcher />
          <div data-testid="current-locale">{locale}</div>
        </div>
      );
    }

    it('toggles between Arabic RTL and French LTR', () => {
      render(
        <LanguageProvider>
          <SwitcherWrapper />
        </LanguageProvider>,
      );

      expect(screen.getByTestId('current-locale').textContent).toBe('ar');

      // Click on Français button via its accessible label
      const frButton = screen.getByRole('button', { name: /Passer en Français/i });
      fireEvent.click(frButton);

      expect(screen.getByTestId('current-locale').textContent).toBe('fr');

      // Click back on العربية button via its accessible label
      const arButton = screen.getByRole('button', { name: /التحويل إلى العربية/i });
      fireEvent.click(arButton);

      expect(screen.getByTestId('current-locale').textContent).toBe('ar');
    });
  });
});
