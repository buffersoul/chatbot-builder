import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ChatPage from './pages/ChatPage'
import IntegrationsPage from './pages/IntegrationsPage'
import BillingPage from './pages/BillingPage'
import DashboardLayout from './components/DashboardLayout'
import { useAuthStore } from './store/authStore'

import SettingsPage from './pages/SettingsPage'

import ConversationsPage from './pages/ConversationsPage'
import AcceptInvitePage from './pages/AcceptInvitePage'; // Import Accept Invite
import ExternalApisPage from './pages/ExternalApisPage';
import BotsPage from './pages/BotsPage'
import { Toaster } from "@/components/ui/toaster"


import DashboardPage from './pages/DashboardPage'

function App() {
    const { checkAuth, isAuthenticated } = useAuthStore((state) => ({
        isAuthenticated: state.isAuthenticated,
        checkAuth: state.checkAuth,
    }));

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
                <Route path="/accept-invite" element={<AcceptInvitePage />} />

                {/* Protected Routes */}
                <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/conversations" element={<ConversationsPage />} />
                    <Route path="/knowledge" element={<KnowledgeBasePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/external-apis" element={<ExternalApisPage />} />
                    <Route path="/bots" element={<BotsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </div>
    )
}

export default App
