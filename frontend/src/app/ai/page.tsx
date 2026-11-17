'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { api } from '@/lib/api';
import { QuickExitButton } from '@/components/quick-exit-button';
import { EmergencyModal } from '@/components/emergency-modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Scale,
  BookOpen,
  Plus,
  Trash2,
  Lock,
  Loader2,
  CheckCircle2,
  Globe,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';

export default function AiAssistantPage() {
  const { user, isAuthenticated } = useAuth();
  const { t, locale, dir } = useI18n();

  // Conversations list & active thread
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input & Language Preference
  const [inputMessage, setInputMessage] = useState('');
  const [preferredLang, setPreferredLang] = useState<'darija' | 'ar' | 'fr'>('darija');

  // Legal corpus modal
  const [legalCorpus, setLegalCorpus] = useState<any[]>([]);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Auto-scroll anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load user conversations and legal corpus
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch legal corpus
      try {
        const corpusRes = await api.ai.getLegalCorpus();
        if (corpusRes?.resources) {
          setLegalCorpus(corpusRes.resources);
        }
      } catch {
        // ignore
      }

      // Fetch user's conversation threads if authenticated
      if (isAuthenticated) {
        const convs = await api.ai.getConversations();
        setConversations(convs);

        if (convs.length > 0) {
          const firstId = convs[0].id;
          setActiveConversationId(firstId);
          const fullConv = await api.ai.getConversation(firstId);
          setMessages(fullConv.messages || []);
        } else {
          // Create initial conversation
          await startNewConversation();
        }
      } else {
        // Guest mode: create an initial active conversation
        const guestConv = await api.ai.createConversation({
          title: locale === 'ar' ? 'استشارة سَنَد الآمنة' : 'Consultation SANAD',
          language: preferredLang,
        });
        setActiveConversationId(guestConv.id);
        setConversations([guestConv]);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (locale === 'ar'
            ? 'تعذر تحميل المحادثات السابقة'
            : 'Impossible de charger l’historique des échanges'),
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, locale, preferredLang]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Switch active conversation
  const selectConversation = async (id: string) => {
    try {
      setLoading(true);
      setActiveConversationId(id);
      const conv = await api.ai.getConversation(id);
      setMessages(conv.messages || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Start new conversation
  const startNewConversation = async () => {
    try {
      setLoading(true);
      const newConv = await api.ai.createConversation({
        title:
          preferredLang === 'darija'
            ? 'استشارة جديدة بالدارجة'
            : preferredLang === 'ar'
            ? 'استشارة جديدة'
            : 'Nouvelle consultation',
        language: preferredLang,
      });

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création de la consultation');
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      !window.confirm(
        locale === 'ar'
          ? 'هل أنتِ متأكدة من حذف هذه المحادثة بالكامل وسرياً؟'
          : 'Confirmez-vous la suppression discrète de cette consultation ?',
      )
    ) {
      return;
    }

    try {
      await api.ai.deleteConversation(id);
      const updated = conversations.filter((c) => c.id !== id);
      setConversations(updated);

      if (activeConversationId === id) {
        if (updated.length > 0) {
          selectConversation(updated[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Impossible de supprimer');
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (customPrompt || inputMessage).trim();
    if (!promptToSend || sending) return;

    setInputMessage('');
    setError(null);

    // Ensure we have an active conversation
    let convId = activeConversationId;
    if (!convId) {
      try {
        const newConv = await api.ai.createConversation({
          title: promptToSend.slice(0, 40),
          language: preferredLang,
        });
        convId = newConv.id;
        setActiveConversationId(convId);
        setConversations([newConv]);
      } catch (err: any) {
        setError('Impossible d’initialiser l’échange');
        return;
      }
    }

    // Add optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      content: promptToSend,
      senderType: 'USER',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      setSending(true);

      const response = await api.ai.sendMessage(convId, {
        content: promptToSend,
        language: preferredLang,
      });

      const assistantMsg = {
        id: response.messageId,
        content: response.content,
        senderType: 'ASSISTANT',
        isDangerAlert: response.isDangerAlert,
        dangerAssessment: response.dangerAssessment,
        legalReferences: response.legalReferences,
        disclaimer: response.disclaimer,
        createdAt: response.createdAt,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update conversation in sidebar list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                updatedAt: new Date().toISOString(),
                title: c.title.includes('استشارة جديدة') || c.title.includes('Nouvelle')
                  ? promptToSend.slice(0, 40) + '...'
                  : c.title,
              }
            : c,
        ),
      );
    } catch (err: any) {
      // Fallback message
      const fallbackMsg = {
        id: `fallback-${Date.now()}`,
        content:
          preferredLang === 'darija'
            ? 'وفق مقتضيات القانون 103-13 ومدونة الأسرة المغربية، كيحميك القانون وعندك الحق تطلبي الحماية الفورية والمساعدة القضائية المجانية. فحال الخطر اتصلي بـ 1919 أو البوليس 19.'
            : preferredLang === 'ar'
            ? 'وفق القانون رقم 103-13 المتعلق بمحاربة العنف ضد النساء، يضمن لكِ التشريع المغربي الحماية الفورية، وأمر إبعاد المعتدي (المادة 82-5 ق.م.ج)، والمساعدة القضائية المجانية.'
            : 'Conformément à la Loi 103-13 et au Code de Procédure Pénale marocain, vous êtes protégée et pouvez solliciter une ordonnance d’éloignement d’urgence et l’aide juridictionnelle gratuite.',
        senderType: 'ASSISTANT',
        isDangerAlert: false,
        legalReferences: legalCorpus.slice(0, 2),
        disclaimer: {
          fr: 'SANAD est un guide d’orientation juridique et ne remplace pas une avocate ou un médecin.',
          ar: 'سَنَد مساعد توجيهي واستشاري، ولا يعوض بأي حال استشارة محامية معتمدة.',
          darija: 'سَنَد كيوجهكِ ويعاونكِ، ولكن ما كيعوضش محامية ولا طبيبة.',
        },
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#FAF7FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Top Reassurance & Emergency Sub-Header */}
      <div className="border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 sticky top-16 z-30 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#5C1F75] to-[#8C2FA8] text-white flex items-center justify-center shadow-md shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t('aiAssistantPage.pageTitle')}
                </h1>
                <Badge className="hidden sm:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                  <ShieldCheck className="h-3 w-3 me-1" />
                  {t('aiAssistantPage.badge')}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {t('aiAssistantPage.piiNotice')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View verified legal sources */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLegalModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs border-purple-200 text-[#5C1F75] hover:bg-purple-50 dark:border-purple-900/50 dark:text-purple-300"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{t('aiAssistantPage.legalCorpusBtn')}</span>
            </Button>

            {/* Emergency Hotline 1919 */}
            <Button
              size="sm"
              onClick={() => setEmergencyModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm"
            >
              <PhoneCall className="h-3.5 w-3.5 animate-pulse" />
              <span className="font-mono">1919</span>
            </Button>

            {/* Quick Exit Header Button */}
            <QuickExitButton variant="header" />
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Conversations Drawer / Center Chat Stream */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-4 p-3 sm:p-5">
        {/* Sidebar: Saved Conversation Threads */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-3">
          <Button
            onClick={startNewConversation}
            className="w-full bg-[#5C1F75] hover:bg-[#48185c] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('aiAssistantPage.newConversation')}</span>
          </Button>

          {/* Conversations History List */}
          <Card className="flex-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
            <CardHeader className="p-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[#5C1F75]" />
                <span>{t('aiAssistantPage.conversationsTitle')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1 flex-1 overflow-y-auto max-h-60 md:max-h-96">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {t('aiAssistantPage.emptyConversations')}
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      activeConversationId === c.id
                        ? 'bg-[#F4ECF9] dark:bg-purple-950/60 text-[#5C1F75] dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-900'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pe-2">
                      <p className="truncate text-xs">{c.title || 'Consultation'}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1 transition-opacity"
                      title={locale === 'ar' ? 'حذف' : 'Supprimer'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Privacy & Anti-Fabrication Notice Box */}
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-200 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="h-3.5 w-3.5 text-[#5C1F75] shrink-0" />
              <span>{locale === 'ar' ? 'سرية مطلقة 100%' : 'Confidentialité totale'}</span>
            </div>
            <p className="text-[10px] text-purple-800 dark:text-purple-300 opacity-90">
              {locale === 'ar'
                ? 'لا يتم حفظ أي معطيات هوياتية مع مزود الذكاء الاصطناعي، ويتم حجب أرقام البطاقة والهواتف تلقائياً.'
                : 'Aucune donnée d’identité n’est transmise au LLM. Le secret de vos échanges est strictement garanti.'}
            </p>
          </div>
        </aside>

        {/* Main Chat Stream Container */}
        <section className="flex-1 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
          {/* Stream Language Switcher Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-[#FAF7FC]/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#5C1F75]" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('aiAssistantPage.languageLabel')}
              </span>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPreferredLang('darija')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  preferredLang === 'darija'
                    ? 'bg-[#5C1F75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                الدارجة المغربية
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('ar')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  preferredLang === 'ar'
                    ? 'bg-[#5C1F75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('fr')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  preferredLang === 'fr'
                    ? 'bg-[#5C1F75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Français
              </button>
            </div>
          </div>

          {/* Messages Stream Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[550px]">
            {/* Welcome banner if no messages */}
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-4 max-w-xl mx-auto">
                <div className="h-16 w-16 rounded-3xl bg-purple-100 text-[#5C1F75] dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center mx-auto shadow-md">
                  <Bot className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {preferredLang === 'darija'
                      ? 'مرحباً بكِ، أنا سَنَد مساعدتكِ الذكية'
                      : preferredLang === 'ar'
                      ? 'أهلاً بكِ في سَنَد، رفيقتكِ القانونية والآمنة'
                      : 'Bienvenue sur SANAD, votre assistante bienveillante'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('aiAssistantPage.subtitle')}
                  </p>
                </div>

                {/* Quick suggestions chips */}
                <div className="pt-2 text-start space-y-2">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {t('aiAssistantPage.suggestionsTitle')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      t('aiAssistantPage.suggestion1'),
                      t('aiAssistantPage.suggestion2'),
                      t('aiAssistantPage.suggestion3'),
                      t('aiAssistantPage.suggestion4'),
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(undefined, suggestion)}
                        className="p-3 rounded-2xl bg-[#FAF7FC] hover:bg-[#F4ECF9] dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-start leading-relaxed transition-all shadow-2xs hover:border-[#5C1F75]/40"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render thread messages */}
            {messages.map((msg, i) => {
              const isUser = msg.senderType === 'USER';
              return (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-3xl leading-relaxed text-xs sm:text-sm shadow-xs ${
                      isUser
                        ? 'bg-[#5C1F75] text-white rounded-br-none'
                        : 'bg-[#FAF7FC] dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* DANGER ALERT BANNER IF TRIGGERED */}
                    {msg.isDangerAlert && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-rose-600 text-white space-y-2 shadow-md">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <AlertTriangle className="h-4 w-4 animate-pulse" />
                          <span>{t('aiAssistantPage.dangerAlertTitle')}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-95">
                          {locale === 'ar'
                            ? 'سلامتكِ في خطر مباشر. ابتعدي فوراً عن مصدر الخطر واتصلي بأرقام النجدة والحماية.'
                            : 'Votre intégrité physique semble en danger. Éloignez-vous immédiatement et contactez les secours.'}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href="tel:1919"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-xs hover:bg-rose-50"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>1919 (Protection)</span>
                          </a>
                          <a
                            href="tel:19"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black"
                          >
                            <span>19 (Police)</span>
                          </a>
                          <a
                            href="tel:177"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
                          >
                            <span>177 (Gendarmerie)</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* VERIFIED LEGAL REFERENCES DISPLAY */}
                    {msg.legalReferences && msg.legalReferences.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <p className="font-bold text-[11px] text-[#5C1F75] dark:text-purple-300 flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5" />
                          <span>{t('aiAssistantPage.legalReferencesTitle')}</span>
                        </p>
                        <div className="space-y-1.5">
                          {msg.legalReferences.map((ref: any, refIdx: number) => (
                            <div
                              key={refIdx}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 text-[11px]"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {ref.titleAr || ref.titleFr}
                                </span>
                                <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-700">
                                  {ref.article}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {t('aiAssistantPage.officialSource')} {ref.officialSource}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ETHICAL DISCLAIMER */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 flex items-start gap-1">
                        <Info className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>{t('aiAssistantPage.disclaimerText')}</span>
                      </div>
                    )}

                    <div className="text-[10px] mt-1.5 text-end opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-2 text-xs italic text-slate-400 p-3 bg-purple-50/50 dark:bg-slate-800/40 rounded-2xl w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-[#5C1F75]" />
                <span>{t('aiAssistantPage.analyzing')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-[#FAF7FC]/50 dark:bg-slate-900/50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('aiAssistantPage.inputPlaceholder')}
                disabled={sending}
                className="rounded-2xl bg-white dark:bg-slate-800 text-xs sm:text-sm py-2.5"
              />
              <Button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="bg-[#5C1F75] hover:bg-[#48185c] text-white px-5 rounded-2xl font-bold shrink-0 shadow-sm"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 me-1.5" />
                    <span>{t('aiAssistantPage.send')}</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>
      </div>

      {/* Verified Moroccan Legal Corpus Modal */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 text-[#5C1F75]" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {locale === 'ar'
                    ? 'النصوص القانونية المغربية المعتمدة في منصة سَنَد'
                    : 'Textes légaux marocains vérifiés'}
                </h3>
              </div>
              <button
                onClick={() => setIsLegalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pe-2 text-xs">
              {legalCorpus.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#5C1F75] dark:text-purple-300">
                      {item.titleAr || item.titleFr}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.article}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {preferredLang === 'darija'
                      ? item.summaryDarija || item.summaryAr
                      : preferredLang === 'ar'
                      ? item.summaryAr
                      : item.summaryFr}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <span className="font-bold">{t('aiAssistantPage.officialSource')}</span>{' '}
                    {item.officialSource}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLegalModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                {locale === 'ar' ? 'إغلاق' : 'Fermer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Moroccan Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
}
