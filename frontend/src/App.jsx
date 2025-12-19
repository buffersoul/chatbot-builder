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

import DashboardPage from './pages/DashboardPage'

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

                {/* Protected Routes */}
                <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/conversations" element={<ConversationsPage />} />
                    <Route path="/knowledge" element={<KnowledgeBasePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="/conversations" element={<div className="p-8">Conversations (Coming Soon)</div>} />
                </Route>
            </Routes>
        </div>
    )
}

export default App
