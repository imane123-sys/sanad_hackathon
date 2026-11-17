const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('sanad_access_token')
      : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMessage =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' ? data : 'Une erreur est survenue');

    const formattedMessage = Array.isArray(errorMessage)
      ? errorMessage.join(', ')
      : errorMessage;

    // Handle token expiration/revocation
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sanad_access_token');
      localStorage.removeItem('sanad_user');
    }

    throw new ApiError(formattedMessage, res.status, data);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (dto: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      preferredLanguage?: string;
    }) =>
      request<{
        message: string;
        user: any;
        verificationToken?: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    login: (dto: { email: string; password: string; deviceInfo?: string }) =>
      request<{
        accessToken: string;
        user: any;
        session: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    verifyEmail: (token: string) =>
      request<{ message: string }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),

    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),

    getSessions: () =>
      request<
        Array<{
          id: string;
          deviceInfo: string;
          ipAddress: string;
          status: string;
          createdAt: string;
          lastActivityAt: string;
          expiresAt: string;
          isCurrent: boolean;
        }>
      >('/auth/sessions', {
        method: 'GET',
      }),

    revokeSession: (sessionId: string) =>
      request<{ message: string }>(`/auth/sessions/${sessionId}/revoke`, {
        method: 'POST',
      }),

    logoutAll: () =>
      request<{ message: string; revokedCount: number }>('/auth/logout-all', {
        method: 'POST',
      }),

    forgotPassword: (email: string) =>
      request<{ message: string; resetToken?: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
      ),

    resetPassword: (dto: { token: string; newPassword: string }) =>
      request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    getProfile: () => request<any>('/auth/profile', { method: 'GET' }),
  },

  system: {
    getHealth: () =>
      request<{ status: string; service: string; uptime: number }>('/health', {
        method: 'GET',
      }),
  },

  ai: {
    getStatus: () =>
      request<{ status: string; activeProvider: string; timestamp: string }>(
        '/ai/status',
        { method: 'GET' },
      ),

    getLegalCorpus: () =>
      request<{
        resources: Array<{
          code: string;
          article: string;
          titleFr: string;
          titleAr: string;
          summaryFr: string;
          summaryAr: string;
          summaryDarija: string;
          officialSource: string;
          keywords: string[];
        }>;
        timestamp: string;
      }>('/ai/legal-resources', { method: 'GET' }),

    generate: (dto: { prompt: string; systemInstruction?: string; temperature?: number; userId?: string }) =>
      request<{ text: string; provider: string; model: string; tokensUsed?: number; interactionId?: string }>(
        '/ai/generate',
        {
          method: 'POST',
          body: JSON.stringify(dto),
        },
      ),

    createConversation: (dto?: { title?: string; language?: string }) =>
      request<{
        id: string;
        userId: string | null;
        title: string;
        language: string;
        createdAt: string;
        updatedAt: string;
        messages: Array<any>;
      }>('/ai/conversations', {
        method: 'POST',
        body: JSON.stringify(dto || {}),
      }),

    getConversations: () =>
      request<
        Array<{
          id: string;
          title: string;
          language: string;
          createdAt: string;
          updatedAt: string;
          messageCount: number;
          lastMessage?: {
            id: string;
            content: string;
            senderType: string;
            createdAt: string;
          } | null;
        }>
      >('/ai/conversations', { method: 'GET' }),

    getConversation: (id: string) =>
      request<{
        id: string;
        userId: string | null;
        title: string;
        language: string;
        createdAt: string;
        updatedAt: string;
        messages: Array<{
          id: string;
          conversationId: string;
          content: string;
          senderType: 'USER' | 'ASSISTANT' | 'SYSTEM';
          isDangerAlert: boolean;
          legalReferences?: any;
          createdAt: string;
        }>;
      }>(`/ai/conversations/${id}`, { method: 'GET' }),

    deleteConversation: (id: string) =>
      request<{ success: boolean; message: string }>(`/ai/conversations/${id}`, {
        method: 'DELETE',
      }),

    sendMessage: (
      conversationId: string,
      dto: { content: string; language?: string },
    ) =>
      request<{
        messageId: string;
        conversationId: string;
        senderType: 'ASSISTANT';
        content: string;
        isDangerAlert: boolean;
        dangerAssessment?: {
          isDangerAlert: boolean;
          dangerLevel: string;
          detectedRisks: string[];
          emergencyOrientation: { fr: string; ar: string; darija: string };
          recommendedHelplines: Array<{
            nameFr: string;
            nameAr: string;
            number: string;
            type: string;
          }>;
        };
        legalReferences: Array<{
          code: string;
          article: string;
          titleFr: string;
          titleAr: string;
          summaryFr: string;
          summaryAr: string;
          summaryDarija: string;
          officialSource: string;
        }>;
        disclaimer: { fr: string; ar: string; darija: string };
        provider: string;
        model: string;
        createdAt: string;
      }>(`/ai/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  },

  admin: {
    getDashboard: () =>
      request<{
        totalUsers: number;
        roleCounts: Record<string, number>;
        activeSessions: number;
        pendingVerifications: number;
        assistanceRequestsCount: number;
        auditLogsCount: number;
        timestamp: string;
      }>('/admin/dashboard', { method: 'GET' }),

    getUsers: () =>
      request<
        Array<{
          id: string;
          email: string;
          firstName: string | null;
          lastName: string | null;
          fullName: string | null;
          phone: string | null;
          role: string;
          status: string;
          isEmailVerified: boolean;
          preferredLanguage: string;
          createdAt: string;
          _count: { sessions: number; assistanceRequests: number };
        }>
      >('/admin/users', { method: 'GET' }),

    updateUserStatus: (userId: string, status: string) =>
      request<any>(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    getVerifications: () =>
      request<Array<any>>('/admin/verifications', { method: 'GET' }),

    reviewVerification: (id: string, status: string, comment?: string) =>
      request<any>(`/admin/verifications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, comment }),
      }),

    getAuditLogs: () =>
      request<Array<any>>('/admin/audit-logs', { method: 'GET' }),
  },

  professional: {
    getDashboard: () =>
      request<{
        professionalId: string;
        professionalType: string;
        specialty: string;
        city: string;
        verificationStatus: string;
        isVolunteer: boolean;
        assignedRequestsCount: number;
        servicesCount: number;
        appointmentsCount: number;
        timestamp: string;
      }>('/professional/dashboard', { method: 'GET' }),

    getProfile: () =>
      request<any>('/professional/profile', { method: 'GET' }),

    updateProfile: (dto: {
      specialty?: string;
      bio?: string;
      city?: string;
      isVolunteer?: boolean;
    }) =>
      request<any>('/professional/profile', {
        method: 'PUT',
        body: JSON.stringify(dto),
      }),

    getServices: () =>
      request<Array<any>>('/professional/services', { method: 'GET' }),

    createService: (dto: {
      name: string;
      description?: string;
      serviceType: string;
      price?: number;
      currency?: string;
    }) =>
      request<any>('/professional/services', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    getRequests: () =>
      request<Array<any>>('/professional/requests', { method: 'GET' }),

    updateRequestStatus: (id: string, status: string, comment?: string) =>
      request<any>(`/professional/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, comment }),
      }),
  },

  organization: {
    getDashboard: () =>
      request<{
        organizationType: string;
        role: string;
        activeRequests: number;
        networkStats: { totalAssociations: number; totalHelpCenters: number };
        timestamp: string;
      }>('/organization/dashboard', { method: 'GET' }),

    getProfile: () =>
      request<any>('/organization/profile', { method: 'GET' }),

    updateProfile: (dto: any) =>
      request<any>('/organization/profile', {
        method: 'PUT',
        body: JSON.stringify(dto),
      }),

    getRequests: () =>
      request<Array<any>>('/organization/requests', { method: 'GET' }),
  },

  user: {
    getDashboard: () =>
      request<{
        user: {
          id: string;
          email: string;
          firstName: string | null;
          lastName: string | null;
          fullName: string | null;
          phone: string | null;
          role: string;
          status: string;
          isEmailVerified: boolean;
          preferredLanguage: string;
          createdAt: string;
        };
        metrics: {
          evidenceCount: number;
          activeRequestsCount: number;
          unreadNotificationsCount: number;
          activeSessionsCount: number;
        };
        recentEvidences: Array<{
          id: string;
          fileName: string;
          fileUrl: string;
          mimeType: string;
          size: number;
          sha256: string;
          description: string | null;
          status: string;
          createdAt: string;
          folder?: { id: string; name: string } | null;
          _count?: { accessLogs: number; sharePermissions: number };
        }>;
        recentRequests: Array<{
          id: string;
          typeAssistance: string;
          description: string | null;
          status: string;
          createdAt: string;
          professional?: {
            user?: {
              firstName: string | null;
              lastName: string | null;
              fullName: string | null;
              phone: string | null;
            };
          } | null;
          statusHistory?: Array<{
            id: string;
            newStatus: string;
            changedAt: string;
          }>;
        }>;
        recentNotifications: Array<{
          id: string;
          type: string;
          neutralContent: string;
          isRead: boolean;
          createdAt: string;
        }>;
        emergencyHelplines: Array<{
          id: string;
          name: string;
          serviceType: string;
          phone: string;
          availability: string;
          city: string | null;
        }>;
        timestamp: string;
      }>('/user/dashboard', { method: 'GET' }),

    getEvidences: () =>
      request<
        Array<{
          id: string;
          fileName: string;
          fileUrl: string;
          mimeType: string;
          size: number;
          sha256: string;
          description: string | null;
          status: string;
          createdAt: string;
          folder?: { id: string; name: string } | null;
          _count?: { accessLogs: number; sharePermissions: number };
        }>
      >('/user/evidences', { method: 'GET' }),

    createEvidence: (dto: {
      fileName: string;
      fileUrl: string;
      mimeType: string;
      size: number;
      sha256: string;
      description?: string;
      folderId?: string;
    }) =>
      request<any>('/user/evidences', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    deleteEvidence: (id: string) =>
      request<{ success: boolean; message: string }>(`/user/evidences/${id}`, {
        method: 'DELETE',
      }),

    getAssistanceRequests: () =>
      request<
        Array<{
          id: string;
          typeAssistance: string;
          description: string | null;
          status: string;
          createdAt: string;
          updatedAt: string;
          professional?: {
            user?: {
              firstName: string | null;
              lastName: string | null;
              fullName: string | null;
              phone: string | null;
              email: string;
            };
          } | null;
          statusHistory?: Array<{
            id: string;
            newStatus: string;
            comment: string | null;
            changedAt: string;
            changedBy?: {
              firstName: string | null;
              lastName: string | null;
              role: string;
            };
          }>;
        }>
      >('/user/assistance-requests', { method: 'GET' }),

    createAssistanceRequest: (dto: {
      typeAssistance: string;
      description?: string;
      professionalId?: string;
      organizationId?: string;
    }) =>
      request<any>('/user/assistance-requests', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    getNotifications: () =>
      request<
        Array<{
          id: string;
          type: string;
          neutralContent: string;
          isRead: boolean;
          readAt: string | null;
          createdAt: string;
        }>
      >('/user/notifications', { method: 'GET' }),

    markNotificationRead: (id: string) =>
      request<any>(`/user/notifications/${id}/read`, {
        method: 'PATCH',
      }),

    markAllNotificationsRead: () =>
      request<{ success: boolean }>('/user/notifications/read-all', {
        method: 'PATCH',
      }),

    getAnalysis: () =>
      request<
        Array<{
          id: string;
          analysisContent: any;
          createdAt: string;
          consent?: { policyVersion: string; grantedAt: string };
        }>
      >('/user/analysis', { method: 'GET' }),

    createAnalysis: (dto: { analysisContent: any }) =>
      request<any>('/user/analysis', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    getResources: (params?: { city?: string; category?: string; query?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.city) searchParams.append('city', params.city);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.query) searchParams.append('query', params.query);
      const queryStr = searchParams.toString();
      return request<{
        professionals: Array<{
          id: string;
          professionalType: string;
          specialty: string;
          city: string;
          address: string | null;
          phone: string | null;
          isVolunteer: boolean;
          verificationStatus: string;
          user: {
            firstName: string | null;
            lastName: string | null;
            fullName: string | null;
            phone: string | null;
            email: string;
          };
          services: Array<any>;
        }>;
        helpCenters: Array<{
          id: string;
          name: string;
          address: string;
          city: string;
          phone: string;
          openingHours: string | null;
          isFree: boolean;
          receptionConditions: string | null;
        }>;
        emergencyResources: Array<{
          id: string;
          name: string;
          serviceType: string;
          phone: string;
          address: string | null;
          city: string | null;
          description: string | null;
          availability: string;
        }>;
        legalResources: Array<{
          id: string;
          title: string;
          description: string;
          legalReference: string;
          officialSource: string;
          category: string;
        }>;
        timestamp: string;
      }>(`/user/resources${queryStr ? `?${queryStr}` : ''}`, { method: 'GET' });
    },
  },

  legal: {
    getResources: (params?: {
      category?: string;
      language?: string;
      search?: string;
      verificationStatus?: 'all' | 'verified' | 'unverified';
      page?: number;
      limit?: number;
    }) => {
      const sp = new URLSearchParams();
      if (params?.category) sp.append('category', params.category);
      if (params?.language) sp.append('language', params.language);
      if (params?.search) sp.append('search', params.search);
      if (params?.verificationStatus) sp.append('verificationStatus', params.verificationStatus);
      if (params?.page) sp.append('page', String(params.page));
      if (params?.limit) sp.append('limit', String(params.limit));
      const qs = sp.toString();
      return request<{
        items: Array<{
          id: string;
          title: string;
          description: string;
          legalReference: string;
          officialSource: string;
          category: string;
          language: string;
          publishedAt: string | null;
          lastVerifiedAt: string | null;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats: {
          totalVerified: number;
          totalUnverified: number;
          totalActive: number;
        };
      }>(`/legal/resources${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },

    getCategories: () =>
      request<
        Array<{
          category: string;
          total: number;
          verified: number;
          unverified: number;
        }>
      >('/legal/categories', { method: 'GET' }),

    getResource: (id: string) =>
      request<{
        id: string;
        title: string;
        description: string;
        legalReference: string;
        officialSource: string;
        category: string;
        language: string;
        publishedAt: string | null;
        lastVerifiedAt: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>(`/legal/resources/${id}`, { method: 'GET' }),

    getAdminResources: (params?: {
      category?: string;
      language?: string;
      search?: string;
      verificationStatus?: 'all' | 'verified' | 'unverified';
      page?: number;
      limit?: number;
    }) => {
      const sp = new URLSearchParams();
      if (params?.category) sp.append('category', params.category);
      if (params?.language) sp.append('language', params.language);
      if (params?.search) sp.append('search', params.search);
      if (params?.verificationStatus) sp.append('verificationStatus', params.verificationStatus);
      if (params?.page) sp.append('page', String(params.page));
      if (params?.limit) sp.append('limit', String(params.limit));
      const qs = sp.toString();
      return request<{
        items: Array<{
          id: string;
          title: string;
          description: string;
          legalReference: string;
          officialSource: string;
          category: string;
          language: string;
          publishedAt: string | null;
          lastVerifiedAt: string | null;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats: {
          totalVerified: number;
          totalUnverified: number;
          totalActive: number;
        };
      }>(`/legal/admin/resources${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },

    createResource: (dto: {
      title: string;
      description: string;
      legalReference: string;
      officialSource: string;
      category: string;
      language?: string;
      publishedAt?: string;
      isVerified?: boolean;
    }) =>
      request<{
        id: string;
        title: string;
        description: string;
        legalReference: string;
        officialSource: string;
        category: string;
        language: string;
        publishedAt: string | null;
        lastVerifiedAt: string | null;
        isActive: boolean;
      }>('/legal/admin/resources', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    updateResource: (
      id: string,
      dto: {
        title?: string;
        description?: string;
        legalReference?: string;
        officialSource?: string;
        category?: string;
        language?: string;
        publishedAt?: string;
        isActive?: boolean;
        isVerified?: boolean;
      },
    ) =>
      request<any>(`/legal/admin/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      }),

    verifyResource: (id: string) =>
      request<any>(`/legal/admin/resources/${id}/verify`, {
        method: 'PATCH',
      }),

    toggleResourceStatus: (id: string) =>
      request<any>(`/legal/admin/resources/${id}/toggle-status`, {
        method: 'PATCH',
      }),

    deleteResource: (id: string) =>
      request<{ success: boolean; id: string }>(`/legal/admin/resources/${id}`, {
        method: 'DELETE',
      }),
  },
};
