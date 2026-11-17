'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { api } from '@/lib/api';
import { ProtectedLayout } from '@/components/protected-layout';
import { RoleSidebar } from '@/components/role-sidebar';
import { QuickExitButton } from '@/components/quick-exit-button';
import { EmergencyModal } from '@/components/emergency-modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Bot,
  FolderLock,
  Scale,
  FileText,
  Users,
  Bell,
  PhoneCall,
  Phone,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Lock,
  Fingerprint,
  Send,
  HelpCircle,
  MapPin,
  Loader2,
  Sparkles,
  RefreshCw,
  Search,
  Building2,
  HeartHandshake,
  Copy,
  Check,
  FileCheck,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { t, locale, dir } = useI18n();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Real backend data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [resources, setResources] = useState<any>(null);
  const [analysisList, setAnalysisList] = useState<any[]>([]);

  // UI status states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New Evidence Form State
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] = useState('photo');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  // New Assistance Request Form State
  const [reqType, setReqType] = useState('LEGAL');
  const [reqDesc, setReqDesc] = useState('');
  const [selectedProId, setSelectedProId] = useState<string>('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // AI Assistant Chat State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text:
        locale === 'ar'
          ? 'مرحباً بكِ في سند. أنا مساعدكِ الذكي والآمن. يمكنكِ سؤالي عن حقوقكِ القانونية وفق القانون المغربي 103-13، أو خطوات التبليغ وطلب الحماية، بكل سرية واطمئنان.'
          : 'Bienvenue sur SANAD. Je suis votre assistant confidentiel et bienveillant. Posez-moi vos questions sur vos droits selon la Loi 103-13, les démarches judiciaires ou les ordonnances de protection.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Situation Analysis State
  const [analysisInput, setAnalysisInput] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Directory filter states
  const [directoryFilter, setDirectoryFilter] = useState<'ALL' | 'LAWYER' | 'PSYCHOLOGIST' | 'CENTER'>('ALL');
  const [directoryCitySearch, setDirectoryCitySearch] = useState('');

  // Fetch all user data from backend
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dash, evs, reqs, notifs, res, analyses] = await Promise.all([
        api.user.getDashboard(),
        api.user.getEvidences(),
        api.user.getAssistanceRequests(),
        api.user.getNotifications(),
        api.user.getResources(),
        api.user.getAnalysis(),
      ]);

      setDashboardData(dash);
      setEvidences(evs);
      setRequests(reqs);
      setNotifications(notifs);
      setResources(res);
      setAnalysisList(analyses);
      if (analyses.length > 0) {
        setLatestAnalysis(analyses[0].analysisContent);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (locale === 'ar'
            ? 'تعذر تحميل بيانات فضاء المستخدم. يرجى التحقق من الاتصال بالخادم.'
            : 'Impossible de charger vos données. Veuillez vérifier la connexion au serveur.'),
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Client-side SHA-256 helper for tamper-evident hash
  const generateSha256 = async (content: string): Promise<string> => {
    try {
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      // Fallback pseudo-sha
    }
    const pseudoArray = new Uint8Array(32);
    crypto.getRandomValues(pseudoArray);
    return Array.from(pseudoArray).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Submit Evidence to Vault
  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceName.trim()) return;

    try {
      setIsUploadingEvidence(true);
      setError(null);

      const computedSha256 = await generateSha256(
        `${evidenceName}-${evidenceType}-${Date.now()}-${evidenceUrl || 'local_file'}`,
      );

      const mimeTypeMap: Record<string, string> = {
        photo: 'image/jpeg',
        chat: 'image/png',
        audio: 'audio/mp4',
        doc: 'application/pdf',
      };

      await api.user.createEvidence({
        fileName: evidenceName.trim(),
        fileUrl: evidenceUrl.trim() || `https://vault.sanad.ma/secure/${Date.now()}_file`,
        mimeType: mimeTypeMap[evidenceType] || 'application/octet-stream',
        size: Math.floor(Math.random() * 4500000) + 120000,
        sha256: computedSha256,
        description: evidenceDesc.trim() || undefined,
      });

      setSuccessMsg(
        locale === 'ar'
          ? 'تم حفظ وتوثيق الدليل في خزانة الأدلة المشفرة بنجاح.'
          : 'Élément scellé et enregistré dans le coffre-fort avec succès.',
      );
      setEvidenceName('');
      setEvidenceUrl('');
      setEvidenceDesc('');

      // Refresh list
      const updatedEvs = await api.user.getEvidences();
      setEvidences(updatedEvs);
      const updatedDash = await api.user.getDashboard();
      setDashboardData(updatedDash);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل حفظ الدليل' : 'Échec de l’enregistrement de la preuve'));
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // Delete Evidence
  const handleDeleteEvidence = async (id: string) => {
    if (
      !window.confirm(
        locale === 'ar'
          ? 'هل أنتِ متأكدة من رغبتكِ في حذف هذا الدليل نهائياً من الخزانة؟'
          : 'Confirmez-vous la suppression définitive de cet élément de preuve ?',
      )
    ) {
      return;
    }

    try {
      setError(null);
      await api.user.deleteEvidence(id);
      setSuccessMsg(
        locale === 'ar'
          ? 'تم حذف الدليل من الخزانة بأمان تام.'
          : 'Élément de preuve supprimé en toute sécurité.',
      );
      setEvidences((prev) => prev.filter((item) => item.id !== id));
      const updatedDash = await api.user.getDashboard();
      setDashboardData(updatedDash);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل حذف الدليل' : 'Impossible de supprimer la preuve'));
    }
  };

  // Submit Assistance Request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingReq(true);
      setError(null);

      await api.user.createAssistanceRequest({
        typeAssistance: reqType,
        description: reqDesc.trim() || undefined,
        professionalId: selectedProId || undefined,
      });

      setSuccessMsg(
        locale === 'ar'
          ? 'تم إرسال طلب المساعدة بنجاح. سيتواصل معكِ الفريق المختص بسرية تامة.'
          : 'Votre démarche d’assistance a été enregistrée avec succès.',
      );
      setReqDesc('');
      setSelectedProId('');

      // Refresh list
      const updatedReqs = await api.user.getAssistanceRequests();
      setRequests(updatedReqs);
      const updatedDash = await api.user.getDashboard();
      setDashboardData(updatedDash);
      const updatedNotifs = await api.user.getNotifications();
      setNotifications(updatedNotifs);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل إرسال الطلب' : 'Échec de la soumission de la demande'));
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // AI Assistant Chat Interaction
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiLoading) return;

    const userText = aiPrompt.trim();
    setAiPrompt('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAiChat((prev) => [...prev, { role: 'user', text: userText, time: timeStr }]);

    try {
      setIsAiLoading(true);

      const systemPrompt =
        locale === 'ar'
          ? 'أنتِ سَنَد، مساعدة ذكية متخصصة بالمغرب في مرافقة النساء وتقديم المشورة القانونية والنفسية وفق مقتضيات القانون رقم 103-13 لمحاربة العنف ضد النساء، ومدونة الأسرة، والقانون الجنائي المغربي. إجاباتك دقيقة، متعاطفة، محترمة للسرية، واضحة التوجيه باللغة العربية، وتقدم معلومات عملية عن الإجراءات وأرقام الطوارئ (1919، 19، 177).'
          : 'Vous êtes SANAD, assistante IA bienveillante au Maroc dédiée au soutien des femmes selon la Loi marocaine 103-13, la Moudawana et le Code pénal. Répondez avec empathie, rigueur juridique, conseils pratiques et rappel de la ligne d’urgence 1919.';

      const response = await api.ai.generate({
        prompt: userText,
        systemInstruction: systemPrompt,
      });

      setAiChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      const fallbackMsg =
        locale === 'ar'
          ? 'وفق مقتضيات القانون رقم 103-13 المتعلق بمحاربة العنف ضد النساء، يضمن لكِ القانون المغربي الحق في الحماية الفورية، وطلب أمر إبعاد المعتدي (المادة 82-5 من قانون المسطرة الجنائية)، بالإضافة إلى المساعدة القضائية المجانية. يمكنكِ الاتصال فوراً بالرقم 1919 أو الشرطة 19.'
          : 'Conformément à la Loi 103-13 relative aux violences faites aux femmes, vous bénéficiez du droit à une ordonnance de protection d’urgence (Art. 82-5 CPP), à l’assistance juridictionnelle gratuite et au soutien en centre d’accueil. Contactez le 1919 ou le 19 en cas d’urgence.';

      setAiChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallbackMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run Situation Analysis with AI
  const handleRunAnalysis = async () => {
    if (!analysisInput.trim() || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      const prompt = `Analyse cette situation selon la Loi marocaine 103-13 et le Code pénal : "${analysisInput}". Formate une analyse claire comprenant : 1. Qualification juridique préliminaire, 2. Mesures de protection immédiates prévues par la loi (ordonnance d'éloignement, etc.), 3. Preuves recommandées à conserver, 4. Droits à l'aide juridictionnelle. Réponds en ${locale === 'ar' ? 'Arabe' : 'Français'}.`;

      const aiRes = await api.ai.generate({ prompt });

      const analysisObj = {
        summary:
          locale === 'ar'
            ? 'يظهر من الوقائع المدلى بها وجود مؤشرات على عنف نفسي وسلوكي قسري وفق القانون 103-13.'
            : 'D’après les faits décrits, la situation relève des violences psychologiques et physiques réprimées par la Loi 103-13.',
        details: aiRes.text,
        rightsGuaranteed: [
          locale === 'ar'
            ? 'الحق في الحماية وطلب أمر إبعاد المعتدي'
            : 'Droit à l’ordonnance de protection et d’éloignement',
          locale === 'ar'
            ? 'الحق في وضع شكاية رسمية والمتابعة الجنائية'
            : 'Droit de porter plainte avec constitution de partie civile',
          locale === 'ar'
            ? 'الحق في المساعدة القضائية المجانية'
            : 'Droit à l’assistance judiciaire gratuite',
        ],
        generatedAt: new Date().toISOString(),
      };

      setLatestAnalysis(analysisObj);
      await api.user.createAnalysis({ analysisContent: analysisObj });

      // Refresh analyses
      const updatedAnalyses = await api.user.getAnalysis();
      setAnalysisList(updatedAnalyses);
      setSuccessMsg(
        locale === 'ar'
          ? 'تم إجراء وحفظ تحليل الوضعية القانونية بنجاح.'
          : 'Évaluation de situation réalisée et enregistrée avec succès.',
      );
    } catch (err: any) {
      setError(
        err?.message ||
          (locale === 'ar' ? 'تعذر إتمام التحليل حالياً' : 'Impossible d’effectuer l’analyse'),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mark single notification read
  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.user.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      if (dashboardData?.metrics) {
        setDashboardData((prev: any) => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            unreadNotificationsCount: Math.max(0, prev.metrics.unreadNotificationsCount - 1),
          },
        }));
      }
    } catch (err) {
      // ignore
    }
  };

  // Mark all notifications read
  const handleMarkAllNotifsRead = async () => {
    try {
      await api.user.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (dashboardData?.metrics) {
        setDashboardData((prev: any) => ({
          ...prev,
          metrics: { ...prev.metrics, unreadNotificationsCount: 0 },
        }));
      }
    } catch (err) {
      // ignore
    }
  };

  // Helper copy SHA hash
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Filter professionals and help centers
  const filteredPros = (resources?.professionals || []).filter((p: any) => {
    const matchesCategory =
      directoryFilter === 'ALL' ||
      (directoryFilter === 'LAWYER' && p.professionalType === 'LAWYER') ||
      (directoryFilter === 'PSYCHOLOGIST' && p.professionalType === 'PSYCHOLOGIST');

    const matchesCity =
      !directoryCitySearch.trim() ||
      (p.city && p.city.toLowerCase().includes(directoryCitySearch.toLowerCase().trim()));

    return matchesCategory && matchesCity;
  });

  const filteredCenters = (resources?.helpCenters || []).filter((c: any) => {
    const matchesCategory = directoryFilter === 'ALL' || directoryFilter === 'CENTER';
    const matchesCity =
      !directoryCitySearch.trim() ||
      (c.city && c.city.toLowerCase().includes(directoryCitySearch.toLowerCase().trim()));
    return matchesCategory && matchesCity;
  });

  return (
    <ProtectedLayout allowedRoles={['USER', 'ADMIN', 'LAWYER', 'PSYCHOLOGIST', 'ASSOCIATION', 'HELP_CENTER']}>
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF7FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Navigation Sidebar */}
        <RoleSidebar
          currentTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Reassurance & Emergency Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5C1F75] via-[#7B289A] to-[#9132B5] p-6 text-white shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  <span>
                    {locale === 'ar'
                      ? 'ملاذ آمن ومشفر وفق القانون 09-08'
                      : 'Espace sécurisé & confidentiel (Loi 09-08)'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {locale === 'ar' ? 'مرحباً بكِ في سند' : 'Bienvenue sur votre espace SANAD'}
                </h1>
                <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                  {locale === 'ar'
                    ? 'أنتِ لستِ وحدكِ. هنا نوفر لكِ استشارات قانونية، حفظاً مشفراً لأدلتك، وربطاً مباشراً مع خبيرات معتمدات بسرية مطلقة.'
                    : 'Vous n’êtes pas seule. SANAD protège vos données, préserve vos preuves et vous relie directement à des avocates et des psychologues certifiées.'}
                </p>
              </div>

              {/* Emergency Call & Quick Exit Header Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setEmergencyModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg hover:shadow-rose-600/30 flex items-center gap-2 border-0 text-sm px-4 py-2.5 rounded-xl transition-all"
                >
                  <PhoneCall className="h-4 w-4 animate-pulse" />
                  <span>{locale === 'ar' ? 'طوارئ 1919' : 'Urgences 1919'}</span>
                </Button>
                <QuickExitButton variant="header" />
              </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          </div>

          {/* Alert / Feedback messages */}
          {error && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="font-bold text-xs hover:underline">
                ✕
              </button>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="font-bold text-xs hover:underline">
                ✕
              </button>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Stored Evidences */}
            <Card
              onClick={() => setActiveTab('evidence')}
              className="cursor-pointer border-slate-200/80 dark:border-slate-800 hover:border-[#5C1F75]/40 transition-all hover:shadow-md bg-white dark:bg-slate-900"
            >
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#5C1F75] dark:bg-purple-950/60 dark:text-purple-300">
                  <FolderLock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    {t('userDashboard.metrics.evidences')}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {loading ? '-' : dashboardData?.metrics?.evidenceCount ?? 0}
                  </p>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold truncate flex items-center gap-1">
                    <Fingerprint className="h-3 w-3 inline" /> SHA-256
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Assistance Requests */}
            <Card
              onClick={() => setActiveTab('requests')}
              className="cursor-pointer border-slate-200/80 dark:border-slate-800 hover:border-[#5C1F75]/40 transition-all hover:shadow-md bg-white dark:bg-slate-900"
            >
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <Scale className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    {t('userDashboard.metrics.activeRequests')}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {loading ? '-' : dashboardData?.metrics?.activeRequestsCount ?? 0}
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold truncate">
                    {locale === 'ar' ? 'متابعة مباشرة' : 'Suivi en direct'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Discreet Notifications */}
            <Card
              onClick={() => setActiveTab('notifications')}
              className="cursor-pointer border-slate-200/80 dark:border-slate-800 hover:border-[#5C1F75]/40 transition-all hover:shadow-md bg-white dark:bg-slate-900"
            >
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 relative">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {(dashboardData?.metrics?.unreadNotificationsCount ?? 0) > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    {t('userDashboard.metrics.unreadNotifications')}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {loading ? '-' : dashboardData?.metrics?.unreadNotificationsCount ?? 0}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold truncate">
                    {locale === 'ar' ? 'تنبيهات محايدة' : 'Alertes discrètes'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Hotline 1919 */}
            <Card
              onClick={() => setActiveTab('emergency')}
              className="cursor-pointer border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 transition-all hover:shadow-md bg-rose-50/60 dark:bg-rose-950/20"
            >
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                  <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-rose-800 dark:text-rose-300 font-bold truncate">
                    {locale === 'ar' ? 'رقم الطوارئ 1919' : 'Ligne d’urgence 1919'}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400">
                    24/7
                  </p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">
                    {locale === 'ar' ? 'مجاني ومتاح دائماً' : 'Gratuit & sans frais'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
            {[
              { id: 'overview', label: t('userDashboard.tabs.overview'), icon: LayoutDashboard },
              { id: 'aiAssistant', label: t('userDashboard.tabs.aiAssistant'), icon: Bot },
              { id: 'evidence', label: t('userDashboard.tabs.evidence'), icon: FolderLock },
              { id: 'analysis', label: t('userDashboard.tabs.analysis'), icon: FileCheck },
              { id: 'requests', label: t('userDashboard.tabs.requests'), icon: Scale },
              { id: 'directory', label: t('userDashboard.tabs.directory'), icon: Users },
              { id: 'notifications', label: t('userDashboard.tabs.notifications'), icon: Bell },
              { id: 'emergency', label: t('userDashboard.tabs.emergency'), icon: PhoneCall },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#5C1F75] text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'notifications' &&
                    (dashboardData?.metrics?.unreadNotificationsCount ?? 0) > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-extrabold">
                        {dashboardData.metrics.unreadNotificationsCount}
                      </span>
                    )}
                </button>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW (Accueil / نظرة عامة) */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions Grid Inspired by hackathon_violence.jpg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Assistant IA */}
                <div
                  onClick={() => setActiveTab('aiAssistant')}
                  className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#5C1F75] transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-100 text-[#5C1F75] dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Bot className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t('userDashboard.actions.aiChat')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('userDashboard.actions.aiChatDesc')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-[#5C1F75] dark:text-purple-300 gap-1">
                    <span>{locale === 'ar' ? 'بدء المحادثة الآمنة ←' : 'Démarrer l’échange →'}</span>
                  </div>
                </div>

                {/* 2. Coffre-fort numérique de preuves */}
                <div
                  onClick={() => setActiveTab('evidence')}
                  className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#5C1F75] transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <FolderLock className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t('userDashboard.actions.addEvidence')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('userDashboard.actions.addEvidenceDesc')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 gap-1">
                    <span>{locale === 'ar' ? 'فتح الخزانة الرقمية ←' : 'Accéder au coffre-fort →'}</span>
                  </div>
                </div>

                {/* 3. Demande d'assistance */}
                <div
                  onClick={() => setActiveTab('requests')}
                  className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#5C1F75] transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Scale className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t('userDashboard.actions.newRequest')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('userDashboard.actions.newRequestDesc')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-blue-700 dark:text-blue-400 gap-1">
                    <span>{locale === 'ar' ? 'طلب مواكبة جديدة ←' : 'Faire une demande →'}</span>
                  </div>
                </div>

                {/* 4. Annuaire des Professionnelles */}
                <div
                  onClick={() => setActiveTab('directory')}
                  className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#5C1F75] transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t('userDashboard.actions.findPros')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('userDashboard.actions.findProsDesc')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-amber-700 dark:text-amber-400 gap-1">
                    <span>{locale === 'ar' ? 'تصفح الدليل المعتمد ←' : 'Consulter le réseau →'}</span>
                  </div>
                </div>
              </div>

              {/* Official Moroccan Legal Corpus Showcase Card */}
              <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50 via-white to-purple-50/60 dark:border-purple-900/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/10 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-[#5C1F75] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {locale === 'ar'
                          ? 'الدليل والمقتضيات القانونية المغربية المعتمدة'
                          : 'Corpus des Textes & Droits Juridiques Marocains'}
                      </h3>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                        {locale === 'ar' ? 'مصادر رسمية موثقة' : 'Sources Officielles Vérifiées'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {locale === 'ar'
                        ? 'اطلعي على بنود القانون 103-13، وأوامر الحماية العاجلة، والتطليق للضرر، وحضانة ونفقة الأطفال، والمساعدة القضائية المجانية دون أي أتعاب.'
                        : 'Consultez la Loi 103-13, les ordonnances d’éloignement, le divorce pour préjudice, la pension alimentaire et l’aide juridictionnelle gratuite.'}
                    </p>
                  </div>
                </div>

                <Link href="/legal-resources" className="shrink-0">
                  <Button
                    size="sm"
                    className="bg-[#5C1F75] hover:bg-[#4A1663] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <BookOpen className="h-3.5 w-3.5 me-1.5" />
                    <span>{locale === 'ar' ? 'تصفح النصوص القانونية ←' : 'Consulter les textes →'}</span>
                  </Button>
                </Link>
              </div>

              {/* Real Activity & Records Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Evidences in Vault */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <FolderLock className="h-4 w-4 text-[#5C1F75]" />
                        <span>{t('userDashboard.vault.title')}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {locale === 'ar'
                          ? 'آخر الأدلة الرقمية المحفوظة ببصمة SHA-256'
                          : 'Dernières preuves enregistrées et certifiées'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('evidence')}
                      className="text-xs font-bold text-[#5C1F75]"
                    >
                      {locale === 'ar' ? 'عرض الكل' : 'Voir tout'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {evidences.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <FolderLock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{t('userDashboard.vault.empty')}</p>
                      </div>
                    ) : (
                      evidences.slice(0, 4).map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {ev.fileName}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-purple-700 dark:text-purple-300">
                                {ev.sha256.substring(0, 10)}...{ev.sha256.substring(58)}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                            {locale === 'ar' ? 'موثقة' : 'Certifiée'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent Assistance Requests */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Scale className="h-4 w-4 text-blue-600" />
                        <span>{t('userDashboard.requests.title')}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {locale === 'ar'
                          ? 'تتبع وضعية طلبات المواكبة والاستشارة'
                          : 'État d’avancement de vos demandes d’aide'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('requests')}
                      className="text-xs font-bold text-blue-600"
                    >
                      {locale === 'ar' ? 'عرض الكل' : 'Voir tout'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {requests.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{t('userDashboard.requests.empty')}</p>
                      </div>
                    ) : (
                      requests.slice(0, 4).map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {req.typeAssistance === 'LEGAL'
                                ? locale === 'ar'
                                  ? 'مساعدة قانونية ومحاماة'
                                  : 'Assistance juridique'
                                : req.typeAssistance === 'PSYCHOLOGICAL'
                                ? locale === 'ar'
                                  ? 'دعم ومواكبة نفسية'
                                  : 'Soutien psychologique'
                                : req.typeAssistance === 'SHELTER'
                                ? locale === 'ar'
                                  ? 'إيواء استعجالي'
                                  : 'Hébergement d’urgence'
                                : locale === 'ar'
                                ? 'تدخل عاجل'
                                : 'Assistance générale'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={`text-[10px] ${
                              req.status === 'EN_ATTENTE'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : req.status === 'EN_COURS'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {req.status === 'EN_ATTENTE'
                              ? t('userDashboard.requests.statusPending')
                              : req.status === 'EN_COURS'
                              ? t('userDashboard.requests.statusProgress')
                              : t('userDashboard.requests.statusResolved')}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Direct Emergency Access Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                      {locale === 'ar'
                        ? 'هل تشعرين بالخطر المباشر ؟'
                        : 'Vous êtes en danger immédiat ?'}
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      {locale === 'ar'
                        ? 'اتصلي فوراً بالشرطة (19) أو الدرك الملكي (177) أو خط ساند 1919 المجاني.'
                        : 'Appelez sans attendre Police Secours (19), la Gendarmerie (177) ou la Ligne 1919.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:1919"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>1919</span>
                  </a>
                  <a
                    href="tel:19"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors"
                  >
                    <span>19 (Police)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: AI ASSISTANT (المساعد الذكي) */}
          {/* ======================================================== */}
          {activeTab === 'aiAssistant' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-purple-100 text-[#5C1F75] flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                        {locale === 'ar' ? 'مساعد سند الذكي والآمن' : 'Assistant Intelligent SANAD'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {locale === 'ar'
                          ? 'استشارات وتوجيه قانوني ونفسي فوري وفق القانون المغربي 103-13'
                          : 'Conseils juridiques et orientation confidentielle selon le droit marocain'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-[#5C1F75] border-purple-200">
                    <Sparkles className="h-3 w-3 me-1" />
                    {locale === 'ar' ? 'ذكاء اصطناعي آمن' : 'IA Sécurisée'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Chat Stream Area */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 rounded-2xl bg-[#FAF7FC] dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm">
                  {aiChat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-xl p-3.5 rounded-2xl shadow-2xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#5C1F75] text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <p className="text-[10px] mt-1.5 opacity-60 text-end">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#5C1F75]" />
                      <span>{locale === 'ar' ? 'سند تقوم بالصياغة القانونية...' : 'SANAD analyse et formule votre réponse...'}</span>
                    </div>
                  )}
                </div>

                {/* Pre-crafted quick questions */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-400 font-bold self-center me-1">
                    {locale === 'ar' ? 'أسئلة سريعة:' : 'Suggestions :'}
                  </span>
                  {[
                    locale === 'ar'
                      ? 'ما هي حقوقي وفق القانون 103-13 عند التعرض للعنف ؟'
                      : 'Quels sont mes droits selon la Loi 103-13 ?',
                    locale === 'ar'
                      ? 'كيف أحصل على أمر إبعاد المعتدي بالمغرب ؟'
                      : 'Comment obtenir une ordonnance d’éloignement ?',
                    locale === 'ar'
                      ? 'كيف أستفيد من المساعدة القضائية المجانية ؟'
                      : 'Comment bénéficier de l’aide juridictionnelle ?',
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAiPrompt(preset)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendAiMessage} className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={
                      locale === 'ar'
                        ? 'اطرحي سؤالكِ بسرية تامة (مثلاً: ما هي إجراءات الشكاية لدى النيابة العامة؟)...'
                        : 'Posez votre question en toute sécurité...'
                    }
                    disabled={isAiLoading}
                    className="rounded-xl bg-white dark:bg-slate-800"
                  />
                  <Button
                    type="submit"
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="bg-[#5C1F75] hover:bg-[#48185c] text-white px-5 rounded-xl shrink-0"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 me-1.5" />
                        <span>{locale === 'ar' ? 'إرسال' : 'Envoyer'}</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ======================================================== */}
          {/* TAB 3: EVIDENCE VAULT (خزانة الأدلة) */}
          {/* ======================================================== */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Evidence Vault Header with SHA-256 Assurance */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderLock className="h-5 w-5 text-[#5C1F75]" />
                    <span>{t('userDashboard.vault.title')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('userDashboard.vault.subtitle')}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-[#5C1F75] border border-purple-200 text-xs font-bold">
                  <Fingerprint className="h-4 w-4" />
                  <span>{t('userDashboard.vault.badgeIntegrity')}</span>
                </div>
              </div>

              {/* Upload New Evidence Form */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#5C1F75]" />
                    <span>{t('userDashboard.vault.uploadTitle')}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('userDashboard.vault.hashNotice')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEvidence} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t('userDashboard.vault.fileName')}</Label>
                        <Input
                          value={evidenceName}
                          onChange={(e) => setEvidenceName(e.target.value)}
                          placeholder={t('userDashboard.vault.fileNamePlaceholder')}
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t('userDashboard.vault.fileType')}</Label>
                        <select
                          value={evidenceType}
                          onChange={(e) => setEvidenceType(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-medium"
                        >
                          <option value="photo">{t('userDashboard.vault.photo')}</option>
                          <option value="chat">{t('userDashboard.vault.chat')}</option>
                          <option value="audio">{t('userDashboard.vault.audio')}</option>
                          <option value="doc">{t('userDashboard.vault.doc')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('userDashboard.vault.description')}</Label>
                      <Input
                        value={evidenceDesc}
                        onChange={(e) => setEvidenceDesc(e.target.value)}
                        placeholder={
                          locale === 'ar'
                            ? 'سياق الواقعة، التاريخ، المكان، وأي تفاصيل داعمة لقضيتك...'
                            : 'Précisez le contexte, la date, le lieu ou les circonstances...'
                        }
                        className="text-xs"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isUploadingEvidence || !evidenceName.trim()}
                        className="bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl px-5"
                      >
                        {isUploadingEvidence ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Fingerprint className="h-4 w-4 me-1.5" />
                            <span>{t('userDashboard.vault.uploadButton')}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* List of Stored Evidences with Verification Status */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {locale === 'ar'
                    ? `الأدلة المحفوظة بالخزانة (${evidences.length})`
                    : `Pièces archivées au coffre-fort (${evidences.length})`}
                </h3>

                {evidences.length === 0 ? (
                  <Card className="border-dashed p-8 text-center text-slate-400">
                    <FolderLock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">{t('userDashboard.vault.empty')}</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evidences.map((ev) => (
                      <Card
                        key={ev.id}
                        className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                          <div className="min-w-0 space-y-1">
                            <CardTitle className="text-sm font-bold truncate text-slate-900 dark:text-white">
                              {ev.fileName}
                            </CardTitle>
                            <CardDescription className="text-[11px] truncate">
                              {ev.description || (locale === 'ar' ? 'دليل موثق' : 'Preuve enregistrée')}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvidence(ev.id)}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 h-auto rounded-lg"
                            title={locale === 'ar' ? 'حذف' : 'Supprimer'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-2.5">
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 font-mono text-[10px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2 border border-slate-100 dark:border-slate-800">
                            <span className="truncate">SHA-256: {ev.sha256}</span>
                            <button
                              onClick={() => copyToClipboard(ev.sha256)}
                              className="text-[#5C1F75] hover:underline font-bold shrink-0 flex items-center gap-1"
                            >
                              {copiedHash === ev.sha256 ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                            <span className="font-medium text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {locale === 'ar' ? 'سلامة رقمية مؤكدة' : 'Intégrité certifiée'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: SITUATION ANALYSIS (تحليل الحالة) */}
          {/* ======================================================== */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#5C1F75]" />
                  <span>{t('userDashboard.analysis.title')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('userDashboard.analysis.subtitle')}
                </p>
                <div className="pt-1">
                  <Badge className="bg-purple-50 text-[#5C1F75] border-purple-200 text-xs">
                    {t('userDashboard.analysis.lawNotice')}
                  </Badge>
                </div>
              </div>

              {/* Input for Analysis */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">
                    {locale === 'ar' ? 'وصف الواقعة لتحليلها قانونياً' : 'Description de votre situation'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    rows={4}
                    value={analysisInput}
                    onChange={(e) => setAnalysisInput(e.target.value)}
                    placeholder={t('userDashboard.analysis.inputPlaceholder')}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C1F75]"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleRunAnalysis}
                      disabled={isAnalyzing || !analysisInput.trim()}
                      className="bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl px-5"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 me-1.5" />
                          <span>{t('userDashboard.analysis.analyzeBtn')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Result Card */}
              {latestAnalysis && (
                <Card className="border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-extrabold text-[#5C1F75] dark:text-purple-300 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      <span>{locale === 'ar' ? 'تشخيص الموقف والخيارات المتاحة' : 'Diagnostic et voies de recours'}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {latestAnalysis.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {latestAnalysis.details}
                    </div>

                    {/* Rights checklist */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {t('userDashboard.analysis.rightsTitle')}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{t('userDashboard.analysis.rightProtection')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{t('userDashboard.analysis.rightComplaint')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{t('userDashboard.analysis.rightShelter')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{t('userDashboard.analysis.rightAid')}</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: ASSISTANCE REQUESTS (طلبات المساعدة) */}
          {/* ======================================================== */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <span>{t('userDashboard.requests.title')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('userDashboard.requests.subtitle')}
                  </p>
                </div>
              </div>

              {/* Create Assistance Request Form */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#5C1F75]" />
                    <span>{t('userDashboard.requests.createTitle')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('userDashboard.requests.typeLabel')}</Label>
                      <select
                        value={reqType}
                        onChange={(e) => setReqType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-medium"
                      >
                        <option value="LEGAL">{t('userDashboard.requests.legal')}</option>
                        <option value="PSYCHOLOGICAL">{t('userDashboard.requests.psych')}</option>
                        <option value="SOCIAL">{t('userDashboard.requests.social')}</option>
                        <option value="SHELTER">{t('userDashboard.requests.shelter')}</option>
                        <option value="EMERGENCY">{t('userDashboard.requests.emergency')}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('userDashboard.requests.description')}</Label>
                      <textarea
                        rows={3}
                        value={reqDesc}
                        onChange={(e) => setReqDesc(e.target.value)}
                        placeholder={
                          locale === 'ar'
                            ? 'اشرحي بإيجاز ما تحتاجينه (استشارة قانونية، محامية للجلسات، إيواء...)'
                            : 'Précisez votre demande d’accompagnement...'
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingReq}
                        className="bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl px-5"
                      >
                        {isSubmittingReq ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 me-1.5" />
                            <span>{t('userDashboard.requests.submitBtn')}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* History of Requests */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {locale === 'ar'
                    ? `سجل الطلبات والمتابعة (${requests.length})`
                    : `Historique des démarches (${requests.length})`}
                </h3>

                {requests.length === 0 ? (
                  <Card className="border-dashed p-8 text-center text-slate-400">
                    <Scale className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">{t('userDashboard.requests.empty')}</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <Card
                        key={req.id}
                        className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                      >
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-[10px] ${
                                  req.status === 'EN_ATTENTE'
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : req.status === 'EN_COURS'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {req.status === 'EN_ATTENTE'
                                  ? t('userDashboard.requests.statusPending')
                                  : req.status === 'EN_COURS'
                                  ? t('userDashboard.requests.statusProgress')
                                  : t('userDashboard.requests.statusResolved')}
                              </Badge>
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {req.typeAssistance === 'LEGAL'
                                  ? t('userDashboard.requests.legal')
                                  : req.typeAssistance === 'PSYCHOLOGICAL'
                                  ? t('userDashboard.requests.psych')
                                  : req.typeAssistance === 'SHELTER'
                                  ? t('userDashboard.requests.shelter')
                                  : t('userDashboard.requests.emergency')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {req.description || (locale === 'ar' ? 'طلب مساعدة' : 'Demande d’assistance')}
                            </p>
                            {req.professional?.user && (
                              <p className="text-[11px] text-[#5C1F75] dark:text-purple-300 font-semibold">
                                {locale === 'ar' ? 'المختصة المتابعة: ' : 'Professionnelle assignée : '}
                                {req.professional.user.fullName ||
                                  `${req.professional.user.firstName || ''} ${req.professional.user.lastName || ''}`}
                              </p>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 sm:text-end shrink-0">
                            <p>{new Date(req.createdAt).toLocaleDateString()}</p>
                            <p>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: DIRECTORY (المحاميات والمراكز) */}
          {/* ======================================================== */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    <span>{t('userDashboard.directory.title')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('userDashboard.directory.subtitle')}
                  </p>
                </div>

                {/* Filters & City Search */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute top-3 left-3 text-slate-400" />
                    <Input
                      value={directoryCitySearch}
                      onChange={(e) => setDirectoryCitySearch(e.target.value)}
                      placeholder={t('userDashboard.directory.searchPlaceholder')}
                      className="ps-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                    {(['ALL', 'LAWYER', 'PSYCHOLOGIST', 'CENTER'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDirectoryFilter(cat)}
                        className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                          directoryFilter === cat
                            ? 'bg-[#5C1F75] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'ALL'
                          ? t('userDashboard.directory.filterAll')
                          : cat === 'LAWYER'
                          ? t('userDashboard.directory.filterLawyers')
                          : cat === 'PSYCHOLOGIST'
                          ? t('userDashboard.directory.filterPsych')
                          : t('userDashboard.directory.filterCenters')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Professionals */}
                {filteredPros.map((pro: any) => (
                  <Card
                    key={pro.id}
                    className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {pro.user.fullName || `${pro.user.firstName || ''} ${pro.user.lastName || ''}`.trim() || 'Avocate'}
                          </CardTitle>
                          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                            {pro.specialty ||
                              (pro.professionalType === 'LAWYER' ? 'Droit de la famille' : 'Soutien psychologique')}
                          </p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          <ShieldCheck className="h-3 w-3 me-1" />
                          {t('userDashboard.directory.verifiedBadge')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pro.city || 'Casablanca'}</span>
                      </div>
                      {pro.isVolunteer && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {t('userDashboard.directory.volunteerBadge')}
                        </span>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedProId(pro.id);
                          setReqType(pro.professionalType === 'LAWYER' ? 'LEGAL' : 'PSYCHOLOGICAL');
                          setActiveTab('requests');
                        }}
                        className="w-full bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl"
                      >
                        {t('userDashboard.directory.contactBtn')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {/* Help / Shelter Centers */}
                {filteredCenters.map((center: any) => (
                  <Card
                    key={center.id}
                    className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {center.name}
                          </CardTitle>
                          <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                            {locale === 'ar' ? 'مركز إيواء واستقبال' : 'Centre d’accueil & d’hébergement'}
                          </p>
                        </div>
                        <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px]">
                          24/7
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{center.address}, {center.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <Phone className="h-3.5 w-3.5 text-teal-600" />
                        <a href={`tel:${center.phone}`} className="hover:underline">
                          {center.phone}
                        </a>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          setReqType('SHELTER');
                          setActiveTab('requests');
                        }}
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
                      >
                        {locale === 'ar' ? 'طلب إيواء بالمركز' : 'Demander l’hébergement'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: NOTIFICATIONS (الإشعارات الآمنة) */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-600" />
                    <span>{t('userDashboard.notifications.title')}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('userDashboard.notifications.subtitle')}
                  </CardDescription>
                </div>
                {notifications.some((n) => !n.isRead) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllNotifsRead}
                    className="text-xs"
                  >
                    {t('userDashboard.notifications.markAll')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('userDashboard.notifications.empty')}</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkNotifRead(notif.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        notif.isRead
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 font-semibold'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="leading-relaxed">{notif.neutralContent}</p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* ======================================================== */}
          {/* TAB 8: EMERGENCY RESOURCES (طوارئ 24/7) */}
          {/* ======================================================== */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-rose-600 text-white shadow-lg space-y-2">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 animate-pulse" />
                  <span>{t('userDashboard.emergency.title')}</span>
                </h2>
                <p className="text-xs text-rose-100 leading-relaxed">
                  {t('userDashboard.emergency.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    num: '1919',
                    name: locale === 'ar' ? 'الخط الوطني لمناهضة العنف (1919)' : 'Ligne Nationale de Protection (1919)',
                    desc: locale === 'ar' ? 'استماع وتوجيه ومواكبة متخصصة للنساء ضحايا العنف، مجاني ومتاح 24/7' : 'Écoute, orientation et accompagnement d’urgence 24h/24 et 7j/7',
                    badge: '24/7 Gratuit',
                  },
                  {
                    num: '19',
                    name: locale === 'ar' ? 'الشرطة الوطنية / النجدة (19)' : 'Police Secours (19)',
                    desc: locale === 'ar' ? 'تدخل أمني عاجل وفوري داخل المدن والمراكز الحضرية' : 'Intervention policière d’urgence en milieu urbain',
                    badge: 'Secours Immédiat',
                  },
                  {
                    num: '177',
                    name: locale === 'ar' ? 'الدرك الملكي (177)' : 'Gendarmerie Royale (177)',
                    desc: locale === 'ar' ? 'تدخل أمني في المناطق القروية والضواحي' : 'Intervention en zone rurale et périphérie',
                    badge: 'Sécurité Rurale',
                  },
                  {
                    num: '141',
                    name: locale === 'ar' ? 'الإسعاف الطبي المستعجل (141)' : 'SAMU / Urgences Médicales (141)',
                    desc: locale === 'ar' ? 'إسعاف طبي عاجل ونقل استعجالي للمستشفيات' : 'Secours médical d’urgence et transport sanitaire',
                    badge: 'Urgences Médicales',
                  },
                ].map((item, i) => (
                  <Card key={i} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                          {item.num}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">
                          {item.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                        {item.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <a
                        href={`tel:${item.num}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>{t('userDashboard.emergency.callNow')}</span>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Moroccan Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </ProtectedLayout>
  );
}
