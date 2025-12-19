import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config
        const { logout, refreshToken, updateAccessToken } = useAuthStore.getState()

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
            originalRequest._retry = true
            try {
                const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
                    refreshToken,
                })
                const { accessToken } = response.data
                updateAccessToken(accessToken)
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                logout()
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)


export const uploadDocument = async (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    })
}

export const getDocuments = async () => {
    return apiClient.get('/documents')
}

export const deleteDocument = async (id) => {
    return apiClient.delete(`/documents/${id}`)
}

// --- Chat API ---

export const sendChatMessage = async (companyId, message, visitorId = null) => {
    const response = await apiClient.post('/chat/message', { company_id: companyId, message, visitor_id: visitorId })
    return response.data
}

export const getChatHistory = async (conversationId) => {
    const response = await apiClient.get(`/chat/history/${conversationId}`)
    return response.data
}

// --- Meta Integration API ---

export const getMetaAuthUrl = async () => {
    const response = await apiClient.get('/meta/auth-url')
    return response.data.url
}

export const getMetaAssets = async () => {
    const response = await apiClient.get('/meta/assets')
    return response.data
}

export const disconnectMetaAsset = async (assetId) => {
    await apiClient.post(`/meta/disconnect/${assetId}`)
}

// --- Billing API ---

export const getPlans = async () => {
    const response = await apiClient.get('/billing/plans')
    return response.data
}

export const getBillingUsage = async () => {
    const response = await apiClient.get('/billing/usage')
    return response.data
}

export const createCheckoutSession = async (data) => {
    const response = await apiClient.post('/billing/checkout', data)
    return response.data
}

export const createPortalSession = async () => {
    const response = await apiClient.post('/billing/portal')
    return response.data
}

// --- Auth API ---

export const getUserProfile = async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
}

export const changePassword = async (data) => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
};

export const getInvoices = async () => {
    const response = await apiClient.get('/billing/invoices')
    return response.data
}

export default apiClient
