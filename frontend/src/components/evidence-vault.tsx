'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FolderLock,
  Fingerprint,
  Plus,
  Trash2,
  Share2,
  History,
  Eye,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Folder,
  FolderPlus,
  UploadCloud,
  X,
  Clock,
  Lock,
  User,
  RefreshCw,
  Loader2,
  File,
  Shield,
  Layers,
} from 'lucide-react';

interface EvidenceVaultProps {
  initialEvidences?: any[];
  onStatsChange?: () => void;
}

export function EvidenceVault({ initialEvidences, onStatsChange }: EvidenceVaultProps) {
  const { t, locale, dir } = useI18n();
  const { user } = useAuth();

  // Tab: My Evidences vs Shared With Me
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');

  // Core Data
  const [evidences, setEvidences] = useState<any[]>(initialEvidences || []);
  const [sharedWithMe, setSharedWithMe] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Loading & Feedback
  const [loading, setLoading] = useState<boolean>(!initialEvidences || initialEvidences.length === 0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFolderId, setUploadFolderId] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Folder Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Assign Folder Modal State
  const [assigningEvidence, setAssigningEvidence] = useState<any | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Hash Verification State
  const [verifications, setVerifications] = useState<
    Record<string, { loading: boolean; verified?: boolean; error?: string; checkedAt?: string }>
  >({});

  // Share Modal State
  const [shareEvidence, setShareEvidence] = useState<any | null>(null);
  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'READ_ONLY' | 'DOWNLOAD'>('READ_ONLY');
  const [shareValidDays, setShareValidDays] = useState(14);
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);

  // Access Logs Modal State
  const [logsEvidence, setLogsEvidence] = useState<any | null>(null);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Document Preview Modal State
  const [previewEvidence, setPreviewEvidence] = useState<any | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewContentType, setPreviewContentType] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Download loading indicator by evidence id
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Load Evidences & Folders
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [evList, foldList, sharedList] = await Promise.all([
        typeof api.user.getEvidences === 'function'
          ? api.user.getEvidences(selectedFolderId || undefined)
          : Promise.resolve([]),
        typeof api.user.getEvidenceFolders === 'function'
          ? api.user.getEvidenceFolders()
          : Promise.resolve([]),
        typeof api.user.getSharedWithMe === 'function'
          ? api.user.getSharedWithMe()
          : Promise.resolve([]),
      ]);

      setEvidences(evList);
      setFolders(foldList);
      setSharedWithMe(sharedList);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (locale === 'ar'
            ? 'تعذر تحميل بيانات خزانة الأدلة'
            : 'Impossible de charger vos données du coffre-fort'),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId, locale]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copy SHA-256 Hash to Clipboard
  const handleCopyHash = async (hash: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
        setCopiedHash(hash);
        setTimeout(() => setCopiedHash(null), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Format File Size
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Get icon for MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-purple-600" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-indigo-600" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-rose-600" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-amber-600" />;
    return <File className="h-5 w-5 text-slate-600" />;
  };

  // File Selection & Drag & Drop Handling
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    // Check size limit: 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(t('userDashboard.vault.fileTooLarge'));
      return;
    }

    // Check executable/forbidden extensions
    const forbidden = /\.(exe|bat|cmd|sh|php|js|vbs|msi|ps1|py)$/i;
    if (forbidden.test(file.name)) {
      setErrorMsg(
        locale === 'ar'
          ? 'صيغة الملف غير مسموح بها لأسباب أمنية.'
          : 'Extension de fichier interdite pour des raisons de sécurité.',
      );
      return;
    }

    setSelectedFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name);
    }
  };

  // Handle Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (uploadDesc.trim()) {
        formData.append('description', uploadDesc.trim());
      }
      if (uploadFolderId) {
        formData.append('folderId', uploadFolderId);
      }

      await api.user.uploadEvidence(formData);

      setSuccessMsg(t('userDashboard.vault.createSuccess'));
      setTimeout(() => setSuccessMsg(null), 4000);

      // Reset form
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFolderId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh list
      await loadData();
      if (onStatsChange) onStatsChange();
    } catch (err: any) {
      setErrorMsg(err?.message || (locale === 'ar' ? 'فشل رفع الملف' : 'Échec du téléversement'));
    } finally {
      setIsUploading(false);
    }
  };

  // Live Verify Hash
  const handleVerifyEvidence = async (id: string) => {
    try {
      setVerifications((prev) => ({ ...prev, [id]: { loading: true } }));
      const result = await api.user.verifyEvidence(id);
      setVerifications((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          verified: result.verified,
          checkedAt: result.checkedAt,
        },
      }));
    } catch (err: any) {
      setVerifications((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          verified: false,
          error: err?.message || 'Erreur',
        },
      }));
    }
  };

  // Handle Download with Bearer Token
  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id);
      setErrorMsg(null);
      await api.user.downloadEvidenceFile(id, fileName);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (locale === 'ar'
            ? 'فشل تنزيل الملف أو غير مصرح به'
            : 'Téléchargement refusé ou non autorisé'),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Secure Preview
  const handleOpenPreview = async (evidence: any) => {
    try {
      setPreviewEvidence(evidence);
      setLoadingPreview(true);
      setErrorMsg(null);

      const { blobUrl, contentType } = await api.user.viewEvidenceBlobUrl(evidence.id);
      setPreviewBlobUrl(blobUrl);
      setPreviewContentType(contentType);
    } catch (err: any) {
      setPreviewEvidence(null);
      setErrorMsg(
        err?.message ||
          (locale === 'ar'
            ? 'تعذر فتح المعاينة الآمنة للملف'
            : 'Impossible d’ouvrir l’aperçu sécurisé'),
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewEvidence(null);
    setPreviewContentType('');
  };

  // Open Share Modal
  const handleOpenShareModal = async (evidence: any) => {
    setShareEvidence(evidence);
    setRecipientEmail('');
    setSharePermission('READ_ONLY');
    setShareValidDays(14);
    try {
      setLoadingShares(true);
      const shares = await api.user.getEvidenceShares(evidence.id);
      setActiveShares(shares);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Impossible de charger les partages');
    } finally {
      setLoadingShares(false);
    }
  };

  // Create Share
  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEvidence || !recipientEmail.trim()) return;

    try {
      setIsSubmittingShare(true);
      setErrorMsg(null);

      await api.user.createEvidenceShare(shareEvidence.id, {
        recipientEmail: recipientEmail.trim(),
        permission: sharePermission,
        validDays: Number(shareValidDays),
      });

      setSuccessMsg(t('userDashboard.vault.shareSuccess'));
      setTimeout(() => setSuccessMsg(null), 4000);
      setRecipientEmail('');

      // Refresh shares
      const shares = await api.user.getEvidenceShares(shareEvidence.id);
      setActiveShares(shares);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || (locale === 'ar' ? 'فشل مشاركة الدليل' : 'Échec du partage'));
    } finally {
      setIsSubmittingShare(false);
    }
  };

  // Revoke Share
  const handleRevokeShare = async (shareId: string) => {
    if (!shareEvidence) return;
    try {
      setErrorMsg(null);
      await api.user.revokeEvidenceShare(shareId);
      setSuccessMsg(t('userDashboard.vault.revokeSuccess'));
      setTimeout(() => setSuccessMsg(null), 3000);

      const shares = await api.user.getEvidenceShares(shareEvidence.id);
      setActiveShares(shares);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || (locale === 'ar' ? 'فشل إلغاء الصلاحية' : 'Échec de la révocation'));
    }
  };

  // Open Access Logs Modal
  const handleOpenLogsModal = async (evidence: any) => {
    setLogsEvidence(evidence);
    try {
      setLoadingLogs(true);
      const logs = await api.user.getEvidenceLogs(evidence.id);
      setAccessLogs(logs);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Impossible de charger l’historique');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setIsCreatingFolder(true);
      setErrorMsg(null);

      await api.user.createEvidenceFolder({
        name: newFolderName.trim(),
        description: newFolderDesc.trim() || undefined,
      });

      setSuccessMsg(t('userDashboard.vault.folderCreated'));
      setTimeout(() => setSuccessMsg(null), 3000);
      setNewFolderName('');
      setNewFolderDesc('');
      setIsFolderModalOpen(false);

      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Impossible de créer le dossier');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Delete Folder
  const handleDeleteFolder = async (folderId: string) => {
    if (
      !window.confirm(
        locale === 'ar'
          ? 'هل أنتِ متأكدة من حذف هذا المجلد؟ الأدلة التي بداخله لن تُحذف وستبقى في الخزانة الرئيسية.'
          : 'Confirmez-vous la suppression de ce dossier ? Les pièces contenues ne seront pas supprimées et resteront dans le coffre-fort.',
      )
    ) {
      return;
    }

    try {
      setErrorMsg(null);
      await api.user.deleteEvidenceFolder(folderId);
      setSuccessMsg(t('userDashboard.vault.folderDeleted'));
      setTimeout(() => setSuccessMsg(null), 3000);

      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Impossible de supprimer le dossier');
    }
  };

  // Assign Evidence to Folder
  const handleAssignFolder = async () => {
    if (!assigningEvidence) return;
    try {
      setIsAssigning(true);
      setErrorMsg(null);

      await api.user.assignEvidenceFolder(
        assigningEvidence.id,
        targetFolderId === '' ? null : targetFolderId,
      );

      setSuccessMsg(
        locale === 'ar' ? 'تم نقل الدليل إلى المجلد بنجاح' : 'Pièce déplacée avec succès',
      );
      setTimeout(() => setSuccessMsg(null), 3000);
      setAssigningEvidence(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Impossible de déplacer la pièce');
    } finally {
      setIsAssigning(false);
    }
  };

  // Delete Evidence
  const handleDeleteEvidence = async (id: string) => {
    if (!window.confirm(t('userDashboard.vault.deleteConfirm'))) return;

    try {
      setErrorMsg(null);
      await api.user.deleteEvidence(id);
      setSuccessMsg(t('userDashboard.vault.deleteSuccess'));
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadData();
      if (onStatsChange) onStatsChange();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Impossible de supprimer la preuve');
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Alert Banners */}
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Vault Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5C1F75] flex items-center justify-center font-bold">
              <FolderLock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('userDashboard.vault.title')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('userDashboard.vault.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* SHA-256 Assurance Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5C1F75] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-bold">
          <Fingerprint className="h-4 w-4 shrink-0" />
          <span>{t('userDashboard.vault.badgeIntegrity')}</span>
        </div>
      </div>

      {/* Vault Navigation Tabs: My Evidences vs Shared With Me */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my'
              ? 'bg-[#5C1F75] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderLock className="h-4 w-4" />
          <span>{t('userDashboard.vault.myEvidences')}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'my' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {evidences.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('shared')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'shared'
              ? 'bg-[#5C1F75] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>{t('userDashboard.vault.sharedWithMeTab')}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'shared' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {sharedWithMe.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: MY EVIDENCES */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Folders Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFolderId === null
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t('userDashboard.vault.allEvidences')}</span>
            </button>

            {folders.map((f) => (
              <div
                key={f.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFolderId === f.id
                    ? 'bg-[#5C1F75] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <button
                  onClick={() => setSelectedFolderId(f.id)}
                  className="flex items-center gap-1.5"
                >
                  <Folder className="h-3.5 w-3.5" />
                  <span>{f.name}</span>
                  {f._count?.evidences !== undefined && (
                    <span className="text-[10px] opacity-80">({f._count.evidences})</span>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteFolder(f.id)}
                  className="text-slate-400 hover:text-rose-500 ms-1 p-0.5"
                  title={locale === 'ar' ? 'حذف المجلد' : 'Supprimer le dossier'}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFolderModalOpen(true)}
              className="text-xs font-bold rounded-lg border-dashed border-purple-300 text-[#5C1F75] hover:bg-purple-50"
            >
              <FolderPlus className="h-3.5 w-3.5 me-1" />
              <span>{t('userDashboard.vault.createFolder')}</span>
            </Button>
          </div>

          {/* Secure File Upload Card with Real Drag & Drop */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-[#5C1F75]" />
                <span>{t('userDashboard.vault.uploadTitle')}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('userDashboard.vault.hashNotice')}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag and drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#5C1F75] bg-purple-50/50 dark:bg-purple-950/20'
                      : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {t('userDashboard.vault.selectedFile')} {selectedFile.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatFileSize(selectedFile.size)} — {selectedFile.type || 'Fichier scellé'}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="mt-1 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        {t('userDashboard.vault.changeFile')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#5C1F75] flex items-center justify-center">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t('userDashboard.vault.chooseFile')}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md">
                        {t('userDashboard.vault.dropNotice')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t('userDashboard.vault.fileName')}</Label>
                    <Input
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder={t('userDashboard.vault.fileNamePlaceholder')}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t('userDashboard.vault.folderSelect')}</Label>
                    <select
                      value={uploadFolderId}
                      onChange={(e) => setUploadFolderId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5C1F75]"
                    >
                      <option value="">{t('userDashboard.vault.noFolder')}</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">{t('userDashboard.vault.description')}</Label>
                  <Input
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
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
                    disabled={isUploading || !selectedFile}
                    className="bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl px-6 py-2.5 shadow-sm"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="h-4 w-4 me-2" />
                        <span>{t('userDashboard.vault.uploadButton')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List of Evidences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>
                  {locale === 'ar'
                    ? `الأدلة المحفوظة بالخزانة (${evidences.length})`
                    : `Pièces archivées au coffre-fort (${evidences.length})`}
                </span>
                {selectedFolderId && (
                  <Badge variant="outline" className="text-xs">
                    📁 {folders.find((f) => f.id === selectedFolderId)?.name || 'Dossier'}
                  </Badge>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadData}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                <RefreshCw className={`h-3.5 w-3.5 me-1 ${loading ? 'animate-spin' : ''}`} />
                <span>{locale === 'ar' ? 'تحديث' : 'Actualiser'}</span>
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2 text-[#5C1F75]" />
                <p className="text-xs">{locale === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>
              </div>
            ) : evidences.length === 0 ? (
              <Card className="border-dashed p-8 text-center text-slate-400">
                <FolderLock className="h-10 w-10 mx-auto mb-2 opacity-40 text-purple-600" />
                <p className="text-xs">{t('userDashboard.vault.empty')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidences.map((ev) => {
                  const activeShareCount = ev._count?.sharePermissions ?? ev.sharePermissions?.length ?? 0;
                  const vStatus = verifications[ev.id];

                  return (
                    <Card
                      key={ev.id}
                      className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                              {getFileIcon(ev.mimeType)}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <CardTitle className="text-sm font-bold truncate text-slate-900 dark:text-white" title={ev.fileName}>
                                {ev.fileName}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                <span>{formatFileSize(ev.size)}</span>
                                <span>•</span>
                                <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                                {ev.folder && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                      📁 {ev.folder.name}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Share Badge */}
                          <div className="shrink-0 flex items-center gap-1">
                            {activeShareCount > 0 ? (
                              <Badge className="bg-purple-50 text-[#5C1F75] border-purple-200 text-[10px]">
                                {t('userDashboard.vault.sharedBadge')} ({activeShareCount})
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                {t('userDashboard.vault.privateBadge')}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-1 space-y-3">
                          {ev.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                              {ev.description}
                            </p>
                          )}

                          {/* SHA-256 Fingerprint */}
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 font-mono text-[10px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <span className="truncate">SHA-256: {ev.sha256}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(ev.sha256)}
                              className="text-[#5C1F75] hover:underline font-bold shrink-0 flex items-center gap-1"
                              title={t('userDashboard.vault.copyHash')}
                            >
                              {copiedHash === ev.sha256 ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Live Integrity Verification Status */}
                          {vStatus && (
                            <div
                              className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border ${
                                vStatus.loading
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : vStatus.verified
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {vStatus.loading ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>{t('userDashboard.vault.verifying')}</span>
                                </>
                              ) : vStatus.verified ? (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>{t('userDashboard.vault.verifySuccess')}</span>
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                                  <span>{t('userDashboard.vault.verifyFailure')}</span>
                                </>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          {/* Preview Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPreview(ev)}
                            className="h-8 px-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs"
                            title={t('userDashboard.vault.viewFile')}
                          >
                            <Eye className="h-3.5 w-3.5 me-1" />
                            <span>{t('userDashboard.vault.viewFile')}</span>
                          </Button>

                          {/* Download Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={downloadingId === ev.id}
                            onClick={() => handleDownload(ev.id, ev.fileName)}
                            className="h-8 px-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs"
                            title={t('userDashboard.vault.downloadFile')}
                          >
                            {downloadingId === ev.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5 me-1" />
                                <span>{t('userDashboard.vault.downloadFile')}</span>
                              </>
                            )}
                          </Button>

                          {/* Verify Hash Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyEvidence(ev.id)}
                            className="h-8 px-2 text-[#5C1F75] hover:bg-purple-100 dark:hover:bg-purple-950/40 rounded-lg text-xs"
                            title={t('userDashboard.vault.verifyHash')}
                          >
                            <Fingerprint className="h-3.5 w-3.5 me-1" />
                            <span>{t('userDashboard.vault.verifyHash')}</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Share Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenShareModal(ev)}
                            className="h-8 px-2 text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg"
                            title={t('userDashboard.vault.shareAction')}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Access Logs Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLogsModal(ev)}
                            className="h-8 px-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                            title={t('userDashboard.vault.accessLogs')}
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>

                          {/* Assign Folder Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAssigningEvidence(ev);
                              setTargetFolderId(ev.folderId || '');
                            }}
                            className="h-8 px-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                            title={t('userDashboard.vault.assignFolder')}
                          >
                            <Folder className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvidence(ev.id)}
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title={locale === 'ar' ? 'حذف' : 'Supprimer'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SHARED WITH ME */}
      {activeTab === 'shared' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Shield className="h-4 w-4 text-[#5C1F75]" />
              <span>
                {locale === 'ar'
                  ? 'أدلة مشفرة تمت مشاركتها معك بسرية'
                  : 'Pièces probatoires partagées confidentiellement avec vous'}
              </span>
            </div>
            <p className="text-[11px] opacity-90">
              {locale === 'ar'
                ? 'يتم فرض التحقق من الأذونات وتاريخ الصلاحية آلياً عند كل عملية اطلاع أو تنزيل.'
                : 'Les autorisations et dates de validité sont appliquées rigoureusement à chaque consultation ou téléchargement.'}
            </p>
          </div>

          {sharedWithMe.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-slate-400">
              <Share2 className="h-10 w-10 mx-auto mb-2 opacity-40 text-purple-600" />
              <p className="text-xs">{t('userDashboard.vault.noSharedWithMe')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedWithMe.map((item) => {
                const ev = item.evidence;
                const isReadOnly = item.permission === 'READ_ONLY';

                return (
                  <Card
                    key={item.shareId}
                    className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                            {getFileIcon(ev.mimeType)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <CardTitle className="text-sm font-bold truncate text-slate-900 dark:text-white" title={ev.fileName}>
                              {ev.fileName}
                            </CardTitle>
                            <div className="text-[11px] text-slate-500">
                              <span>{formatFileSize(ev.size)}</span>
                              {ev.user && (
                                <span className="ms-2">
                                  {t('userDashboard.vault.sharedBy')}{' '}
                                  <strong className="text-slate-700 dark:text-slate-300">
                                    {ev.user.fullName || `${ev.user.firstName || ''} ${ev.user.lastName || ''}`.trim() || ev.user.email}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Permission Scope Badge */}
                        <Badge
                          className={`text-[10px] shrink-0 ${
                            isReadOnly
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isReadOnly
                            ? t('userDashboard.vault.readOnly')
                            : t('userDashboard.vault.downloadAllowed')}
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 space-y-2.5">
                        {ev.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {ev.description}
                          </p>
                        )}

                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {t('userDashboard.vault.expiresOn')}{' '}
                            <strong>{new Date(item.validUntil).toLocaleDateString()}</strong>
                          </span>
                        </div>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 font-mono text-[10px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="truncate">SHA-256: {ev.sha256}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(ev.sha256)}
                            className="text-[#5C1F75] hover:underline font-bold shrink-0 flex items-center gap-1"
                          >
                            {copiedHash === ev.sha256 ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {/* View File */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenPreview(ev)}
                          className="h-8 px-2.5 text-[#5C1F75] hover:bg-purple-100 rounded-lg text-xs font-bold"
                        >
                          <Eye className="h-3.5 w-3.5 me-1" />
                          <span>{t('userDashboard.vault.viewFile')}</span>
                        </Button>

                        {/* Download File (if DOWNLOAD scope permitted) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isReadOnly || downloadingId === ev.id}
                          onClick={() => handleDownload(ev.id, ev.fileName)}
                          className={`h-8 px-2.5 rounded-lg text-xs ${
                            isReadOnly
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-slate-700 hover:bg-slate-200'
                          }`}
                          title={
                            isReadOnly
                              ? 'Le téléchargement a été restreint par la propriétaire'
                              : t('userDashboard.vault.downloadFile')
                          }
                        >
                          {downloadingId === ev.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 me-1" />
                              <span>{t('userDashboard.vault.downloadFile')}</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerifyEvidence(ev.id)}
                        className="h-8 px-2 text-slate-500 hover:text-[#5C1F75] text-xs"
                      >
                        <Fingerprint className="h-3.5 w-3.5 me-1" />
                        <span>{t('userDashboard.vault.verifyHash')}</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: SHARE PERMISSION MODAL */}
      {/* ======================================================== */}
      {shareEvidence && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-[#5C1F75]" />
                  <span>{t('userDashboard.vault.shareTitle')}</span>
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-sm">
                  {shareEvidence.fileName}
                </p>
              </div>
              <button
                onClick={() => setShareEvidence(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grant Share Form */}
            <form onSubmit={handleCreateShare} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold">{t('userDashboard.vault.recipientEmail')}</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="avocate@barreau.ma, psychologue@centre.ma"
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">{t('userDashboard.vault.shareScope')}</Label>
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-medium"
                  >
                    <option value="READ_ONLY">{t('userDashboard.vault.readOnly')}</option>
                    <option value="DOWNLOAD">{t('userDashboard.vault.downloadAllowed')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">{t('userDashboard.vault.validity')}</Label>
                  <select
                    value={shareValidDays}
                    onChange={(e) => setShareValidDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-medium"
                  >
                    <option value={7}>7 {t('userDashboard.vault.days')}</option>
                    <option value={14}>14 {t('userDashboard.vault.days')}</option>
                    <option value={30}>30 {t('userDashboard.vault.days')}</option>
                    <option value={90}>90 {t('userDashboard.vault.days')}</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingShare || !recipientEmail.trim()}
                className="w-full bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl py-2"
              >
                {isSubmittingShare ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Share2 className="h-4 w-4 me-1.5" />
                    <span>{locale === 'ar' ? 'منح صلاحية المشاركة' : 'Accorder l’accès sécurisé'}</span>
                  </>
                )}
              </Button>
            </form>

            {/* Active Shares List */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('userDashboard.vault.activeShares')}
              </h4>

              {loadingShares ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                  <span>{locale === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</span>
                </div>
              ) : activeShares.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  {t('userDashboard.vault.noShares')}
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeShares.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate text-slate-900 dark:text-white">
                          {s.recipient?.email || s.recipientId}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] py-0 px-1">
                            {s.permission === 'READ_ONLY'
                              ? t('userDashboard.vault.readOnly')
                              : t('userDashboard.vault.downloadAllowed')}
                          </Badge>
                          <span>
                            {t('userDashboard.vault.expiresOn')}{' '}
                            {new Date(s.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeShare(s.id)}
                        className="text-xs text-rose-600 hover:bg-rose-50 h-7 px-2 shrink-0 font-bold"
                      >
                        {t('userDashboard.vault.revokeShare')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareEvidence(null)}
                className="text-xs font-bold rounded-xl"
              >
                {t('userDashboard.vault.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ACCESS LOGS / TRAÇABILITÉ (LOI 09-08) */}
      {/* ======================================================== */}
      {logsEvidence && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-[#5C1F75]" />
                  <span>{t('userDashboard.vault.logsTitle')}</span>
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-md">
                  {logsEvidence.fileName} — SHA-256: {logsEvidence.sha256}
                </p>
              </div>
              <button
                onClick={() => setLogsEvidence(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingLogs ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#5C1F75]" />
                <span>{locale === 'ar' ? 'جاري استخراج السجلات...' : 'Chargement des journaux...'}</span>
              </div>
            ) : accessLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                {t('userDashboard.vault.noLogs')}
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {accessLogs.map((log) => {
                  const isSuccess = log.result === 'SUCCESS';
                  const actionMap: Record<string, string> = {
                    VIEW: locale === 'ar' ? 'معاينة' : 'Consultation',
                    DOWNLOAD: locale === 'ar' ? 'تنزيل' : 'Téléchargement',
                    SHARE: locale === 'ar' ? 'مشاركة' : 'Partage',
                    DELETE: locale === 'ar' ? 'حذف' : 'Suppression',
                    VERIFY_HASH: locale === 'ar' ? 'تحقق من البصمة' : 'Vérification SHA-256',
                  };

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] py-0 px-1.5 font-bold ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {actionMap[log.action] || log.action}
                          </Badge>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {log.user?.fullName || `${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim() || log.user?.email || log.userId}
                          </span>
                          {log.user?.role && (
                            <span className="text-[10px] text-slate-400">({log.user.role})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                          {log.ipAddress && (
                            <span>• IP: {log.ipAddress}</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-end">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                            isSuccess ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                          <span>{log.result}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogsEvidence(null)}
                className="text-xs font-bold rounded-xl"
              >
                {t('userDashboard.vault.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: IN-APP SECURE DOCUMENT PREVIEW */}
      {/* ======================================================== */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {previewEvidence.fileName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {formatFileSize(previewEvidence.size)} — {t('userDashboard.vault.previewModalTitle')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(previewEvidence.id, previewEvidence.fileName)}
                  className="text-xs font-bold rounded-xl h-8"
                >
                  <Download className="h-3.5 w-3.5 me-1" />
                  <span>{t('userDashboard.vault.downloadFile')}</span>
                </Button>
                <button
                  onClick={handleClosePreview}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-950 min-h-[300px]">
              {loadingPreview ? (
                <div className="text-center text-xs text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#5C1F75]" />
                  <span>{locale === 'ar' ? 'جاري فك التشفير والتحميل...' : 'Déchiffrement et chargement...'}</span>
                </div>
              ) : previewBlobUrl ? (
                previewContentType.startsWith('image/') ? (
                  <img
                    src={previewBlobUrl}
                    alt={previewEvidence.fileName}
                    className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-xs"
                  />
                ) : previewContentType.startsWith('audio/') ? (
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-center space-y-3">
                    <Music className="h-12 w-12 mx-auto text-[#5C1F75]" />
                    <p className="text-xs font-bold">{previewEvidence.fileName}</p>
                    <audio controls className="w-full max-w-md mx-auto" src={previewBlobUrl}>
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>
                ) : previewContentType.startsWith('video/') ? (
                  <video
                    controls
                    className="max-h-[65vh] max-w-full rounded-lg shadow-xs"
                    src={previewBlobUrl}
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                ) : previewContentType.includes('pdf') ? (
                  <iframe
                    src={previewBlobUrl}
                    title={previewEvidence.fileName}
                    className="w-full h-[65vh] rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl space-y-3 max-w-md">
                    <FileText className="h-12 w-12 mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {previewEvidence.fileName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {locale === 'ar'
                        ? 'المعاينة المباشرة غير مدعومة لهذا النوع من الملفات. يرجى استخدام زر التحميل لفتحه.'
                        : 'Aperçu non disponible pour ce type de fichier. Utilisez le bouton Télécharger pour l’ouvrir.'}
                    </p>
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-400">Aperçu indisponible</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CREATE FOLDER */}
      {/* ======================================================== */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-[#5C1F75]" />
                <span>{t('userDashboard.vault.createFolder')}</span>
              </h3>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">{t('userDashboard.vault.folderName')}</Label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Procédure 2026, Échanges WhatsApp, Certificats..."
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">{t('userDashboard.vault.folderDesc')}</Label>
                <Input
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Ex: Pièces relatives à la plainte déposée au tribunal..."
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="text-xs font-bold rounded-xl"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl"
                >
                  {isCreatingFolder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{t('userDashboard.vault.createFolder')}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: ASSIGN EVIDENCE TO FOLDER */}
      {/* ======================================================== */}
      {assigningEvidence && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Folder className="h-4 w-4 text-[#5C1F75]" />
                <span>{t('userDashboard.vault.assignFolder')}</span>
              </h3>
              <button
                onClick={() => setAssigningEvidence(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {locale === 'ar'
                ? `اختاري المجلد المناسب لتصنيف الدليل: "${assigningEvidence.fileName}"`
                : `Sélectionnez le dossier de classement pour la pièce : "${assigningEvidence.fileName}"`}
            </p>

            <div className="space-y-1">
              <Label className="text-xs font-bold">{t('userDashboard.vault.folderSelect')}</Label>
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-medium"
              >
                <option value="">{t('userDashboard.vault.noFolder')}</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssigningEvidence(null)}
                className="text-xs font-bold rounded-xl"
              >
                {locale === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
              <Button
                onClick={handleAssignFolder}
                disabled={isAssigning}
                className="bg-[#5C1F75] hover:bg-[#48185c] text-white text-xs font-bold rounded-xl"
              >
                {isAssigning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{locale === 'ar' ? 'تأكيد النقل' : 'Enregistrer le classement'}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
